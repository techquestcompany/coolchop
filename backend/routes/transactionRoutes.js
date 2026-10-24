const express = require("express");
const router = express.Router();
const transactionController = require("../controllers/transactionController");
const authMiddleware = require('../utils/tokenAuth');
const requireRole = require("../utils/requireRole");

// Get all transactions
router.get("/allTransactions", authMiddleware, requireRole("admin"), transactionController.getAllTransactions);

// Get transactions for logged-in user
router.get("/userTransactions", authMiddleware, requireRole("customer", "rider"), transactionController.getUserTransactions);

// Delete transaction
router.delete("/transaction/:id", authMiddleware, requireRole("admin"), transactionController.deleteTransaction);

module.exports = router;
