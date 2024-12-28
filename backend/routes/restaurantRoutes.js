const express = require('express');
const resController = require('../controllers/resController');
const router = express.Router();

router.post('/signup', resController.addRestaurant);
router.post('/login', resController.login);
router.post('/dish', resController.createDishes);
router.get('/restaurants', resController.getAllRestaurants);
router.get('/myrestaurant', resController.getRestaurantById);
router.get('/dishes', resController.getAllDishes);
router.get('/mydishes', resController.getDishById);

module.exports = router;