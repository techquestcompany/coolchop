const express = require('express');
const reviewsController = require('../controllers/reviewController');
const tokenMiddleware = require("../utils/tokenAuth")
const requireRole = require("../utils/requireRole");
const router = express.Router();

router.post('/add', tokenMiddleware, requireRole("customer"), reviewsController.addDishReview);

// ⭐ Restaurant reviews
router.get('/restaurant/:restaurantId', reviewsController.getReviewsByRestaurant);

// ⭐ Dish reviews
router.post('/dish/add', tokenMiddleware, requireRole("customer"), reviewsController.addDishReview);
router.get('/dish/:dishId', reviewsController.getReviewsByDish);

module.exports = router;
