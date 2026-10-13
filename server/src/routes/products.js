const { Router } = require('express');
const validate = require('../middleware/validate');
const { authenticate, requireRole } = require('../middleware/auth');
const {
  listProductsQuery,
  productIdParams,
  createProductBody,
  updateProductBody,
} = require('../validators/products');
const {
  listProducts,
  getProduct,
  createProduct,
  updateProduct,
  deleteProduct,
} = require('../controllers/productController');

const router = Router();

// Сначала проверка токена и роли, потом данных: без прав ответ 401/403, а не 400
const adminOnly = [authenticate, requireRole('admin')];

// Каталог открыт и для гостей: токен не нужен
router.get('/', validate(listProductsQuery, 'query'), listProducts);
router.get('/:id', validate(productIdParams, 'params'), getProduct);

router.post('/', ...adminOnly, validate(createProductBody), createProduct);
router.patch('/:id', ...adminOnly, validate(productIdParams, 'params'), validate(updateProductBody), updateProduct);
router.delete('/:id', ...adminOnly, validate(productIdParams, 'params'), deleteProduct);

module.exports = router;
