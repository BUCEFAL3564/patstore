const prisma = require('../lib/prisma');
const { HttpError } = require('../lib/httpError');
const { toPublicProduct } = require('../serializers/product');

// Prisma в MySQL не экранирует спецсимволы LIKE: без этого search=% находил бы все товары
const escapeLike = (value) => value.replace(/[\\%_]/g, (char) => `\\${char}`);

// Все фильтры превращаются в WHERE запроса к БД, а не применяются к массиву в памяти (требование ТЗ).
// Регистр при поиске не учитывается за счёт коллации utf8mb4_unicode_ci у таблицы
function buildProductWhere({ search, min_price, max_price, min_rating }) {
  const where = { deleted_at: null };

  if (search) {
    const pattern = escapeLike(search);
    where.OR = [{ title: { contains: pattern } }, { description: { contains: pattern } }];
  }
  if (min_price !== undefined || max_price !== undefined) {
    where.price = { gte: min_price, lte: max_price };
  }
  if (min_rating !== undefined) {
    where.rating = { gte: min_rating };
  }

  return where;
}

// Сортировка, LIMIT/OFFSET и подсчёт тоже выполняет БД. id — второй ключ сортировки:
// при одинаковых ценах порядок стабилен, и товары не повторяются и не теряются между страницами
async function listProducts(req, res) {
  const { page, limit, sort_by, order = 'asc', ...filters } = req.validated.query;
  const where = buildProductWhere(filters);

  // count и выборка страницы в одной транзакции, чтобы meta и items не разошлись
  const [total_items, products] = await prisma.$transaction([
    prisma.product.count({ where }),
    prisma.product.findMany({
      where,
      orderBy: sort_by ? [{ [sort_by]: order }, { id: 'asc' }] : [{ id: order }],
      skip: (page - 1) * limit,
      take: limit,
    }),
  ]);

  res.json({
    items: products.map(toPublicProduct),
    meta: {
      total_items,
      total_pages: Math.ceil(total_items / limit),
      current_page: page,
      limit,
    },
  });
}

async function getProduct(req, res) {
  const product = await prisma.product.findFirst({
    where: { id: req.validated.params.id, deleted_at: null },
  });
  if (!product) {
    throw new HttpError(404, 'Product not found');
  }

  res.json(toPublicProduct(product));
}

module.exports = { listProducts, getProduct };
