const prisma = require('../lib/prisma');
const { HttpError } = require('../lib/httpError');
const { toPublicProduct } = require('../serializers/product');
const { readCatalogPage, writeCatalogPage, invalidateCatalog } = require('../services/catalogCache');

const escapeLike = (value) => value.replace(/[\\%_]/g, (char) => `\\${char}`);

function buildProductWhere({ search, min_price, max_price, min_rating, category }) {
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
  if (category) {
    where.category = category;
  }

  return where;
}

async function listProducts(req, res) {
  const cached = await readCatalogPage(req.validated.query);
  if (cached.body) {
    res.set('X-Cache', 'HIT').type('application/json').send(cached.body);
    return;
  }

  const { page, limit, sort_by, order = 'asc', ...filters } = req.validated.query;
  const where = buildProductWhere(filters);

  const [total_items, products] = await prisma.$transaction([
    prisma.product.count({ where }),
    prisma.product.findMany({
      where,
      orderBy: sort_by ? [{ [sort_by]: order }, { id: 'asc' }] : [{ id: order }],
      skip: (page - 1) * limit,
      take: limit,
    }),
  ]);

  const body = JSON.stringify({
    items: products.map(toPublicProduct),
    meta: {
      total_items,
      total_pages: Math.ceil(total_items / limit),
      current_page: page,
      limit,
    },
  });
  await writeCatalogPage(cached.key, body);

  res.set('X-Cache', cached.key ? 'MISS' : 'BYPASS').type('application/json').send(body);
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

async function createProduct(req, res) {
  const product = await prisma.product.create({ data: req.validated.body });
  await invalidateCatalog();

  res.status(201).location(`/api/products/${product.id}`).json(toPublicProduct(product));
}

async function updateProduct(req, res) {
  const { id } = req.validated.params;
  const { count } = await prisma.product.updateMany({
    where: { id, deleted_at: null },
    data: req.validated.body,
  });
  if (count === 0) {
    throw new HttpError(404, 'Product not found');
  }
  await invalidateCatalog();

  const product = await prisma.product.findUnique({ where: { id } });
  res.json(toPublicProduct(product));
}

async function deleteProduct(req, res) {
  const { id } = req.validated.params;
  const { count } = await prisma.product.updateMany({
    where: { id, deleted_at: null },
    data: { deleted_at: new Date() },
  });
  if (count === 0) {
    throw new HttpError(404, 'Product not found');
  }
  await invalidateCatalog();

  res.status(204).end();
}

module.exports = { listProducts, getProduct, createProduct, updateProduct, deleteProduct };
