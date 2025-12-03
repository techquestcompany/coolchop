const express = require('express');
const reviewsController = require('../controllers/reviewController');
const tokenMiddleware = require("../utils/tokenAuth")
const router = express.Router();

router.post('/add',tokenMiddleware, reviewsController.addDishReview);

// ⭐ Restaurant reviews
router.get('/restaurant/:restaurantId', reviewsController.getReviewsByRestaurant);

// ⭐ Dish reviews
router.post('/dish/add', reviewsController.addDishReview);
router.get('/dish/:dishId', reviewsController.getReviewsByDish);

module.exports = router;
