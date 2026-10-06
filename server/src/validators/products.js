const { z } = require('zod');

// Query-параметры приходят строками. Пустое значение (?min_price=) считаем «не задано»,
// иначе z.coerce превратил бы его в 0
const emptyToUndefined = (value) => (value === '' ? undefined : value);

const optionalNumber = (field, { min, max }) => {
  let schema = z.coerce.number(`${field} must be a number`).min(min, `${field} must be >= ${min}`);
  if (max !== undefined) schema = schema.max(max, `${field} must be <= ${max}`);
  return z.preprocess(emptyToUndefined, schema.optional());
};

const listProductsQuery = z
  .object({
    search: z.preprocess(
      (value) => (typeof value === 'string' ? value.trim() || undefined : value),
      z.string('search must be a string').max(100, 'search is too long').optional()
    ),
    min_price: optionalNumber('min_price', { min: 0 }),
    max_price: optionalNumber('max_price', { min: 0 }),
    min_rating: optionalNumber('min_rating', { min: 0, max: 5 }),
  })
  .refine(
    (q) => q.min_price === undefined || q.max_price === undefined || q.min_price <= q.max_price,
    { message: 'min_price must be <= max_price', path: ['min_price'] }
  );

const productIdParams = z.object({
  id: z.coerce.number('id must be a number').int('id must be an integer').positive('id must be positive'),
});

module.exports = { listProductsQuery, productIdParams };
