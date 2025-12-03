const express = require('express');
const ratingsController = require('../controllers/ratingsController');
const tokenMiddleware = require("../utils/tokenAuth");
const router = express.Router();

router.post('/add', tokenMiddleware, ratingsController.addDishRating);

router.get('/restaurant/:restaurantId', ratingsController.getRatingsByRestaurant);

router.get('/dish/:dishId', ratingsController.getRatingsByDish);

module.exports = router;
