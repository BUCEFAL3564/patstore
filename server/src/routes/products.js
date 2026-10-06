const { Router } = require('express');
const validate = require('../middleware/validate');
const { listProductsQuery, productIdParams } = require('../validators/products');
const { listProducts, getProduct } = require('../controllers/productController');

const router = Router();

// Каталог открыт и для гостей: токен не нужен
router.get('/', validate(listProductsQuery, 'query'), listProducts);
router.get('/:id', validate(productIdParams, 'params'), getProduct);

module.exports = router;
