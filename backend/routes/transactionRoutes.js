const express = require("express");
const router = express.Router();
const transactionController = require("../controllers/transactionController");
const authMiddleware = require('../utils/tokenAuth');

// Create a new transaction
router.post("/createTransaction", transactionController.createTransaction);

// Get all transactions
router.get("/allTransactions", transactionController.getAllTransactions);

// Get transactions for logged-in user
router.get("/userTransactions", authMiddleware, transactionController.getUserTransactions);

// Delete transaction
router.delete("/transaction/:id", authMiddleware, transactionController.deleteTransaction);

module.exports = router;
