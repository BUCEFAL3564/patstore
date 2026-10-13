const { Router } = require('express');
const validate = require('../middleware/validate');
const { authenticate } = require('../middleware/auth');
const {
  addCartItemBody,
  updateCartItemBody,
  cartItemIdParams,
  applyPromoBody,
} = require('../validators/cart');
const {
  getCart,
  addItem,
  updateItem,
  deleteItem,
  applyPromo,
  removePromo,
} = require('../controllers/cartController');

const router = Router();

// Корзина личная: без токена — 401. Пользователь берётся из токена, а не из запроса,
// поэтому до чужой корзины не добраться
router.use(authenticate);

router.get('/', getCart);
router.post('/items', validate(addCartItemBody), addItem);
router.patch('/items/:id', validate(cartItemIdParams, 'params'), validate(updateCartItemBody), updateItem);
router.delete('/items/:id', validate(cartItemIdParams, 'params'), deleteItem);
router.post('/apply-promo', validate(applyPromoBody), applyPromo);
router.delete('/promo', removePromo);

module.exports = router;
