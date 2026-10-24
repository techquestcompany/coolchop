const express = require('express');
const { addToCart, getCart, removeFromCart, updateCartQuantity } = require('../controllers/cartController');
const tokenMiddleware = require("../utils/tokenAuth")
const requireRole = require("../utils/requireRole");
const router = express.Router();

router.post('/add', tokenMiddleware, requireRole("customer"), addToCart);
router.get('/get', tokenMiddleware, requireRole("customer"), getCart);
router.delete('/remove', tokenMiddleware, requireRole("customer"), removeFromCart);
router.put('/update-quantity', tokenMiddleware, requireRole("customer"), updateCartQuantity);

module.exports = router;
