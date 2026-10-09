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

  return {
    id: cart.id,
    items,
    total_quantity: totalQuantity,
    subtotal: subtotalCents / 100,
  };
}

module.exports = { toPublicCart, toCents };
