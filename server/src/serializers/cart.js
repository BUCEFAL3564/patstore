const { toPublicProduct } = require('./product');

// Деньги считаем в целых центах: 0.1 + 0.2 в float даёт 0.30000000000000004
const toCents = (value) => Math.round(Number(value) * 100);

// Товар, удалённый админом (soft-delete), остаётся в корзине с is_available: false —
// пользователь видит, что он пропал, но в сумму и количество он не входит
function toPublicCart(cart) {
  let subtotalCents = 0;
  let totalQuantity = 0;

  const items = cart.items.map((item) => {
    const isAvailable = item.product.deleted_at === null;
    const lineCents = toCents(item.product.price) * item.quantity;
    if (isAvailable) {
      subtotalCents += lineCents;
      totalQuantity += item.quantity;
    }
    return {
      id: item.id,
      product_id: item.product_id,
      quantity: item.quantity,
      line_total: lineCents / 100,
      is_available: isAvailable,
      product: toPublicProduct(item.product),
    };
  });

  // Скидка считается от суммы доступных товаров и округляется до цента.
  // Промокод, который выключили после применения (is_active = false), больше не действует
  const promo = cart.promo_code?.is_active ? cart.promo_code : null;
  const discountCents = promo ? Math.round((subtotalCents * promo.discount_percentage) / 100) : 0;

  return {
    id: cart.id,
    items,
    total_quantity: totalQuantity,
    subtotal: subtotalCents / 100,
    promo: promo ? { code: promo.code, discount_percentage: promo.discount_percentage } : null,
    discount: discountCents / 100,
    total: (subtotalCents - discountCents) / 100,
  };
}

module.exports = { toPublicCart, toCents };
