// controllers/transactionController.js
const { Transaction, User, Order } = require("../models");


exports.createTransaction = async (req, res) => {
  try {
    const { orderId, amount, customerId, status } = req.body;

    if (!customerId) {
      return res.status(400).json({ error: "Customer Ids are required" });
    }

    const transaction = await Transaction.create({
      orderId,
      amount,
      status: status || "pending",
      customerId
    });

    res.status(201).json(transaction);
  } catch (error) {
    console.error("Error creating transaction:", error);
    res.status(500).json({ error: "Failed to create transaction" });
  }
};

exports.getUserTransactions = async (req, res) => {
  try {
    const userId = req.user.id;  // ✔ Get from token

    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const offset = (page - 1) * limit;

    const { count, rows } = await Transaction.findAndCountAll({
      where: { userId: userId }, 
      include: [
        { model: Order,as :"order", attributes: ["orderNumber", "status"] }
      ],
      limit,
      offset,
      order: [["createdAt", "DESC"]],
    });

    res.status(200).json({
      total: count,
      page,
      limit,
      totalPages: Math.ceil(count / limit),
      data: rows,
    });

  } catch (error) {
    console.error("Error fetching user transactions:", error);
    res.status(500).json({ message: "Failed to fetch transactions" });
  }
};






exports.getTransactionsByRider = async (req, res) => {
  try {
    const { riderId } = req.params;
    const transactions = await Transaction.findAll({
      where: { riderId },
      include: [{ model: User, as: "customer", attributes: ["id", "name"] }],
      order: [["createdAt", "DESC"]],
    });

    res.json(transactions);
  } catch (error) {
    res.status(500).json({ error: "Failed to fetch rider transactions" });
  }
};

exports.deleteTransaction = async (req, res) => {
  try {
    const { id } = req.params;

    const deleted = await Transaction.destroy({ where: { id } });

    if (!deleted) {
      return res.status(404).json({ message: "Transaction not found" });
    }

    res.json({ message: "Transaction deleted successfully" });

  } catch (error) {
    console.error("Error deleting transaction:", error);
    res.status(500).json({ message: "Failed to delete transaction" });
  }
};


exports.getAllTransactions = async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 20;
    const offset = (page - 1) * limit;

    const { count, rows } = await Transaction.findAndCountAll({
      include: [
        { model: User, attributes: ["id", "name", "email"] },
        { model: Order, attributes: ["reference", "status"] },
      ],
      limit,
      offset,
      order: [["createdAt", "DESC"]],
    });

    res.status(200).json({
      total: count,
      page,
      limit,
      totalPages: Math.ceil(count / limit),
      data: rows,
    });
  } catch (error) {
    console.error("Error fetching all transactions:", error);
    res.status(500).json({ message: "Failed to fetch transactions" });
  }
};


exports.deleteTransaction = async (req, res) => {
  try {
    const { id } = req.params;
    const deleted = await Transaction.destroy({ where: { id } });

    if (!deleted) {
      return res.status(404).json({ message: "Transaction not found" });
    }

    res.json({ message: "Transaction deleted successfully" });
  } catch (error) {
    console.error("Error deleting transaction:", error);
    res.status(500).json({ message: "Failed to delete transaction" });
  }
};
 