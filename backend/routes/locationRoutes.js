const express = require('express');
const locationController = require('../controllers/locationController');
const tokenMiddleware = require("../utils/tokenAuth")
const requireRole = require("../utils/requireRole");
const router = express.Router();

router.put('/confirm', tokenMiddleware, requireRole("customer", "rider"), locationController.updateUserLocation);
router.get('/check', tokenMiddleware, requireRole("customer", "rider"), locationController.getConfirmLocationById);


module.exports = router;