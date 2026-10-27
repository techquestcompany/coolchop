const express = require('express');
const router = express.Router();
const OrderController = require('../controllers/orderController');
const tokenMiddleware = require("../utils/tokenAuth")
const requireRole = require("../utils/requireRole");

<<<<<<< HEAD
router.get('/user_orders', tokenMiddleware, requireRole("customer", "rider", "admin"), OrderController.getAllOrders);
router.get('/all_orders', tokenMiddleware, requireRole("admin"), OrderController.getAllOrders);
router.get('/restaurant_orders', tokenMiddleware, requireRole("restaurant"), OrderController.getRestaurantOrders);
router.get('/:orderId', tokenMiddleware, OrderController.getOrderById);
router.put('/:orderId', tokenMiddleware, requireRole("customer", "restaurant", "admin"), OrderController.updateOrder);
router.delete('/:orderId', tokenMiddleware, requireRole("customer", "admin"), OrderController.deleteOrder);
=======
// Routes for managing orders
router.get('/user_orders',tokenMiddleware, OrderController.getUserOrders); 
router.get('/all_orders',OrderController.getAllOrders);
router.get('/rider_orders',OrderController.getRiderOrders);  
router.get('/orders/:orderId', OrderController.getOrderById); 
router.post('/save', OrderController.createOrder); 
router.put('/orders/:orderId', OrderController.updateOrder); 
router.delete('/orders/:orderId', OrderController.deleteOrder); 
>>>>>>> 661a36b ( modified the controller files)


module.exports = router;
