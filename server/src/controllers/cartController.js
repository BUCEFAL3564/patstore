const { Prisma } = require('@prisma/client');
const prisma = require('../lib/prisma');
const { HttpError } = require('../lib/httpError');
const { toPublicCart } = require('../serializers/cart');
const { MAX_QUANTITY } = require('../validators/cart');

const CART_INCLUDE = {
  items: { orderBy: { id: 'asc' }, include: { product: true } },
  promo_code: true,
};

const isPrismaError = (err, ...codes) =>
  err instanceof Prisma.PrismaClientKnownRequestError && codes.includes(err.code);
const isUniqueViolation = (err) => isPrismaError(err, 'P2002');

// Корзина создаётся при первом обращении. upsert в Prisma для MySQL — это SELECT, потом INSERT,
// поэтому два одновременных первых запроса могут столкнуться на уникальном user_id.
// Тогда просто читаем корзину, которую создал соседний запрос
async function getOrCreateCart(userId) {
  try {
    return await prisma.cart.upsert({
      where: { user_id: userId },
      update: {},
      create: { user_id: userId },
      include: CART_INCLUDE,
    });
  } catch (err) {
    if (!isUniqueViolation(err)) throw err;
    return prisma.cart.findUnique({ where: { user_id: userId }, include: CART_INCLUDE });
  }
}

const sendCart = async (res, userId, status = 200) =>
  res.status(status).json(toPublicCart(await getOrCreateCart(userId)));

const notEnoughStock = (product) =>
  new HttpError(409, 'Not enough stock', [
    { field: 'quantity', message: `only ${product.stock_quantity} left in stock` },
  ]);

const tooMany = () =>
  new HttpError(409, 'Too many items', [
    { field: 'quantity', message: `quantity of one item cannot exceed ${MAX_QUANTITY}` },
  ]);

async function getCart(req, res) {
  await sendCart(res, req.user.id);
}

// Повторное добавление того же товара увеличивает количество, а не создаёт вторую строку.
// Ответ — вся корзина: фронтенду не нужен отдельный запрос, чтобы перерисовать её
async function addItem(req, res) {
  const { product_id, quantity } = req.validated.body;
  const cart = await getOrCreateCart(req.user.id);

  const addOnce = () =>
    prisma.$transaction(async (tx) => {
      const product = await tx.product.findFirst({ where: { id: product_id, deleted_at: null } });
      if (!product) throw new HttpError(404, 'Product not found');

      const existing = await tx.cartItem.findUnique({
        where: { cart_id_product_id: { cart_id: cart.id, product_id } },
      });

      if (!existing) {
        if (quantity > product.stock_quantity) throw notEnoughStock(product);
        await tx.cartItem.create({ data: { cart_id: cart.id, product_id, quantity } });
        return true;
      }

      // Атомарно в БД: UPDATE ... SET quantity = quantity + ? блокирует строку до конца транзакции,
      // поэтому одновременные добавления выстраиваются в очередь, а не затирают друг друга
      // (прочитать, прибавить и записать в JS теряло бы добавления). Лимиты проверяем по
      // результату; исключение откатывает транзакцию вместе с увеличением
      const updated = await tx.cartItem.update({
        where: { id: existing.id },
        data: { quantity: { increment: quantity } },
      });
      if (updated.quantity > MAX_QUANTITY) throw tooMany();
      if (updated.quantity > product.stock_quantity) throw notEnoughStock(product);
      return false;
    });

  // Одновременные запросы могут столкнуться в БД: два INSERT одного нового товара (P2002),
  // позицию удалили между чтением и UPDATE (P2025), взаимная блокировка (P2034).
  // Тогда повторяем: со второй попытки запрос увидит уже существующую строку
  let created;
  for (let attempt = 1; ; attempt++) {
    try {
      created = await addOnce();
      break;
    } catch (err) {
      if (attempt >= 3 || !isPrismaError(err, 'P2002', 'P2025', 'P2034')) throw err;
    }
  }

  await sendCart(res, req.user.id, created ? 201 : 200);
}

// Чужую позицию найти нельзя: условие cart.user_id в том же запросе, ответ 404, а не 403,
// чтобы не подсказывать, что такой id вообще существует
async function updateItem(req, res) {
  const { id } = req.validated.params;
  const { quantity } = req.validated.body;

  const item = await prisma.cartItem.findFirst({
    where: { id, cart: { user_id: req.user.id } },
    include: { product: true },
  });
  if (!item) throw new HttpError(404, 'Cart item not found');
  if (item.product.deleted_at) throw new HttpError(409, 'Product is no longer available');
  if (quantity > item.product.stock_quantity) throw notEnoughStock(item.product);

  const { count } = await prisma.cartItem.updateMany({
    where: { id, cart: { user_id: req.user.id } },
    data: { quantity },
  });
  if (count === 0) throw new HttpError(404, 'Cart item not found');

  await sendCart(res, req.user.id);
}

async function deleteItem(req, res) {
  const { count } = await prisma.cartItem.deleteMany({
    where: { id: req.validated.params.id, cart: { user_id: req.user.id } },
  });
  if (count === 0) throw new HttpError(404, 'Cart item not found');

  await sendCart(res, req.user.id);
}

// ТЗ: проверка промокода и расчёт итога заказа со скидкой. Промокод запоминается в корзине,
// поэтому скидка пересчитывается сама, если потом изменить состав корзины
async function applyPromo(req, res) {
  const promo = await prisma.promoCode.findUnique({ where: { code: req.validated.body.code } });
  if (!promo) throw new HttpError(404, 'Promo code not found');
  if (!promo.is_active) throw new HttpError(400, 'Promo code is not active');

  const cart = await getOrCreateCart(req.user.id);
  await prisma.cart.update({ where: { id: cart.id }, data: { promo_code_id: promo.id } });

  await sendCart(res, req.user.id);
}

// Для кнопки «убрать промокод» на странице корзины
async function removePromo(req, res) {
  const cart = await getOrCreateCart(req.user.id);
  await prisma.cart.update({ where: { id: cart.id }, data: { promo_code_id: null } });

  await sendCart(res, req.user.id);
}

module.exports = { getCart, addItem, updateItem, deleteItem, applyPromo, removePromo };
