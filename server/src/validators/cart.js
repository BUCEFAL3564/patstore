const { z } = require('zod');

// Ограничение на одну позицию корзины, чтобы нельзя было положить 10^9 штук
const MAX_QUANTITY = 99;

const quantity = z
  .number('quantity must be a number')
  .int('quantity must be an integer')
  .min(1, 'quantity must be >= 1')
  .max(MAX_QUANTITY, `quantity must be <= ${MAX_QUANTITY}`);

const addCartItemBody = z.object({
  product_id: z
    .number('product_id must be a number')
    .int('product_id must be an integer')
    .positive('product_id must be positive'),
  quantity: quantity.default(1),
});

// Чтобы убрать товар, есть DELETE; quantity = 0 здесь не принимается
const updateCartItemBody = z.object({ quantity });

const cartItemIdParams = z.object({
  id: z.coerce.number('id must be a number').int('id must be an integer').positive('id must be positive'),
});

module.exports = { MAX_QUANTITY, addCartItemBody, updateCartItemBody, cartItemIdParams };
