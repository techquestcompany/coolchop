const express = require('express');
const { addToCart, getCart, removeFromCart, updateCartQuantity } = require('../controllers/cartController');
const tokenMiddleware = require("../utils/tokenAuth")
const router = express.Router();

router.post('/add',tokenMiddleware, addToCart);
router.get('/get',tokenMiddleware, getCart);
router.delete('/remove', removeFromCart);
router.put('/update-quantity',tokenMiddleware, updateCartQuantity); 

module.exports = router;
