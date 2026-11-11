const { toPublicProduct } = require('./product');

const toCents = (value) => Math.round(Number(value) * 100);

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
