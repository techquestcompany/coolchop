const express = require('express');
const resController = require('../controllers/resController');
const tokenMiddleware = require("../utils/tokenAuth")
const router = express.Router();

router.post('/signup', resController.addRestaurant);
router.post('/login', resController.login);
router.post('/dish', tokenMiddleware, resController.createDishes);

router.get('/restaurants', resController.getAllRestaurants);
router.get('/myrestaurant', tokenMiddleware, resController.getRestaurantById);
router.delete("/dish/:id", tokenMiddleware, resController.deleteDish);
router.get('/restaurant_dish',tokenMiddleware, resController.getDishesByRestaurantId);
router.get('/dishes', resController.getAllDishes);
router.get('/dish/:id', resController.getDishById);



module.exports = router;