const express = require('express');
const router = express.Router();
const OrderController = require('../controllers/orderController');
const tokenMiddleware = require("../utils/tokenAuth")
const requireRole = require("../utils/requireRole");

router.get('/user_orders', tokenMiddleware, requireRole("customer", "rider", "admin"), OrderController.getAllOrders);
router.get('/all_orders', tokenMiddleware, requireRole("admin"), OrderController.getAllOrders);
router.get('/restaurant_orders', tokenMiddleware, requireRole("restaurant"), OrderController.getRestaurantOrders);
router.get('/:orderId', tokenMiddleware, OrderController.getOrderById);
router.put('/:orderId', tokenMiddleware, requireRole("customer", "restaurant", "admin"), OrderController.updateOrder);
router.delete('/:orderId', tokenMiddleware, requireRole("customer", "admin"), OrderController.deleteOrder);


module.exports = router;
