const { z } = require('zod');

// Query-параметры приходят строками. Пустое значение (?min_price=) считаем «не задано»,
// иначе z.coerce превратил бы его в 0
const emptyToUndefined = (value) => (value === '' ? undefined : value);

const optionalNumber = (field, { min, max }) => {
  let schema = z.coerce.number(`${field} must be a number`).min(min, `${field} must be >= ${min}`);
  if (max !== undefined) schema = schema.max(max, `${field} must be <= ${max}`);
  return z.preprocess(emptyToUndefined, schema.optional());
};

const positiveInt = (field, { max, defaultValue }) =>
  z.preprocess(
    emptyToUndefined,
    z.coerce
      .number(`${field} must be a number`)
      .int(`${field} must be an integer`)
      .min(1, `${field} must be >= 1`)
      .max(max, `${field} must be <= ${max}`)
      .default(defaultValue)
  );

// Регистр не важен: ?order=DESC тоже принимается
const optionalEnum = (field, values) =>
  z.preprocess(
    (value) => (typeof value === 'string' ? value.trim().toLowerCase() || undefined : value),
    z.enum(values, `${field} must be one of: ${values.join(', ')}`).optional()
  );

const listProductsQuery = z
  .object({
    page: positiveInt('page', { max: 100000, defaultValue: 1 }),
    limit: positiveInt('limit', { max: 100, defaultValue: 12 }),
    sort_by: optionalEnum('sort_by', ['price', 'title']),
    order: optionalEnum('order', ['asc', 'desc']),
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

// В БД price — DECIMAL(10,2), rating — DECIMAL(2,1): лишние знаки после запятой отклоняем,
// а не даём MySQL молча их округлить
const hasMaxDecimals = (digits) => (value) => {
  const scaled = value * 10 ** digits;
  return Math.abs(scaled - Math.round(scaled)) < 1e-6;
};
// Убирает хвосты float-арифметики: 0.1 + 0.2 = 0.30000000000000004 → 0.3
const roundTo = (digits) => (value) => Math.round(value * 10 ** digits) / 10 ** digits;

// Пустая строка в необязательном текстовом поле = «очистить» (null)
const optionalText = (field, max) =>
  z.preprocess(
    (value) => (typeof value === 'string' ? value.trim() || null : value),
    z.string(`${field} must be a string`).max(max, `${field} is too long`).nullable().optional()
  );

const productFields = {
  title: z.string('title is required').trim().min(1, 'title is required').max(255, 'title is too long'),
  description: z.string('description must be a string').trim().max(5000, 'description is too long'),
  price: z
    .number('price must be a number')
    .min(0, 'price must be >= 0')
    .max(99999999.99, 'price is too large')
    .refine(hasMaxDecimals(2), 'price must have at most 2 decimal places')
    .transform(roundTo(2)),
  rating: z
    .number('rating must be a number')
    .min(0, 'rating must be >= 0')
    .max(5, 'rating must be <= 5')
    .refine(hasMaxDecimals(1), 'rating must have at most 1 decimal place')
    .transform(roundTo(1)),
  // Минимум 3 картинки — требование ТЗ для слайдера. Только http(s), чтобы не пропустить javascript: и т.п.
  images: z
    .array(z.url({ protocol: /^https?$/, error: 'each image must be an http(s) URL' }), 'images must be an array of URLs')
    .min(3, 'at least 3 images are required')
    .max(10, 'at most 10 images are allowed'),
  category: optionalText('category', 100),
  platform: optionalText('platform', 50),
  stock_quantity: z
    .number('stock_quantity must be a number')
    .int('stock_quantity must be an integer')
    .min(0, 'stock_quantity must be >= 0')
    .max(1000000, 'stock_quantity is too large'),
};

// Лишние поля (id, created_at, deleted_at и т.д.) zod отбрасывает, задать их через API нельзя
const createProductBody = z.object({
  ...productFields,
  description: productFields.description.default(''),
  rating: productFields.rating.default(0),
  stock_quantity: productFields.stock_quantity.default(0),
});

const updateProductBody = z
  .object(productFields)
  .partial()
  .refine((body) => Object.values(body).some((value) => value !== undefined), {
    message: 'at least one field must be provided',
  });

module.exports = { listProductsQuery, productIdParams, createProductBody, updateProductBody };
