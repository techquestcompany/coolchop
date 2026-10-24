const express = require('express');
const transactionInitController = require('../controllers/transInitialiserController');
const paymentReconciliationController = require('../controllers/paymentReconciliationController');
const tokenMiddleware = require('../utils/tokenAuth');
const requireRole = require('../utils/requireRole');
const router = express.Router();

router.post('/initialise', tokenMiddleware, requireRole("customer"), transactionInitController.initializeTransaction);
router.post(
  '/reconcile/:reference',
  tokenMiddleware,
  requireRole("customer"),
  paymentReconciliationController.reconcilePayment
);

module.exports = router;
