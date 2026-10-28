const express = require('express');
const ratingsController = require('../controllers/ratingsController');
const tokenMiddleware = require("../utils/tokenAuth");
const requireRole = require("../utils/requireRole");
const router = express.Router();

router.post('/add', tokenMiddleware, requireRole("customer"), ratingsController.addDishRating);
router.post('/restaurant/add', tokenMiddleware, requireRole("customer"), ratingsController.addRestaurantRating);

router.get('/restaurant/:restaurantId', ratingsController.getRatingsByRestaurant);

router.get('/dish/:dishId', ratingsController.getRatingsByDish);

module.exports = router;
