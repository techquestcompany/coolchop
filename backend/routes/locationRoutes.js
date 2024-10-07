const express = require('express');
const locationController = require('../controllers/locationController');
const router = express.Router();

router.post('/confirm', locationController.confirmLocation);
router.post('/check', locationController.getConfirmLocationById);


module.exports = router;
