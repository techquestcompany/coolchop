const express = require('express');
const transactionInitController = require('../controllers/transInitialiserController');
const router = express.Router();

router.post('/initialise', transactionInitController.initializeTransaction);

module.exports = router;
