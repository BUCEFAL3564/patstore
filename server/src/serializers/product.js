// Prisma отдаёт Decimal-поля объектами, и в JSON они превратились бы в строки ("29.99").
// По ТЗ price и rating — числа, поэтому приводим явно. deleted_at наружу не отдаём
function toPublicProduct(product) {
  return {
    id: product.id,
    title: product.title,
    description: product.description,
    price: Number(product.price),
    rating: Number(product.rating),
    images: product.images,
    category: product.category,
    platform: product.platform,
    stock_quantity: product.stock_quantity,
    created_at: product.created_at,
  };
}

module.exports = { toPublicProduct };
