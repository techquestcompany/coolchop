const express = require('express');
const resController = require('../controllers/resController');
const tokenMiddleware = require("../utils/tokenAuth")
const requireRole = require("../utils/requireRole");
const router = express.Router();

router.post('/signup', resController.addRestaurant);
router.post('/login', resController.login);
router.patch('/approve/:id', tokenMiddleware, requireRole("admin"), resController.approveRestaurant);
router.post('/dish', tokenMiddleware, requireRole("restaurant"), resController.createDishes);

router.get('/restaurants', resController.getAllRestaurants);
router.get('/myrestaurant', tokenMiddleware, requireRole("restaurant"), resController.getRestaurantById);
router.patch('/myrestaurant', tokenMiddleware, requireRole("restaurant"), resController.updateRestaurantProfile);
router.delete("/dish/:id", tokenMiddleware, requireRole("restaurant"), resController.deleteDish);
router.get('/restaurant_dish', tokenMiddleware, requireRole("restaurant"), resController.getDishesByRestaurantId);
router.get('/restaurants/:restaurantId/dishes', resController.getDishesForRestaurant);
router.get('/restaurants/:id', resController.getPublicRestaurantById);
router.get('/dishes', resController.getAllDishes);
router.get('/dish/:id', resController.getDishById);
router.get('/dishes/search', resController.searchDishes);
router.get('/search', resController.searchRestaurants);


module.exports = router;
