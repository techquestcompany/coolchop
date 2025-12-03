const express = require('express');
const locationController = require('../controllers/locationController');
const tokenMiddleware = require("../utils/tokenAuth")
const router = express.Router();

router.put('/confirm',tokenMiddleware, locationController.updateUserLocation);
router.get('/check',tokenMiddleware, locationController.getConfirmLocationById);


module.exports = router;