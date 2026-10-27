// controllers/transactionController.js
const { Transaction, User, Order } = require("../models");


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
    res.status(500).json({ message: "We couldn't load your transactions right now. Please try again." });
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
    console.error("Error fetching rider transactions:", error);
    res.status(500).json({ error: "We couldn't load rider transactions right now. Please try again." });
  }
};

exports.deleteTransaction = async (req, res) => {
  try {
    const { id } = req.params;

    const transaction = await Transaction.findByPk(id);
    if (!transaction) {
      return res.status(404).json({ message: "Transaction not found" });
    }
    if (
      transaction.userId !== req.user.id &&
      String(req.user.role).toLowerCase() !== "admin"
    ) {
      return res.status(403).json({ message: "You don't have permission to delete this transaction." });
    }

    await transaction.destroy();

    res.json({ message: "Transaction deleted successfully" });

  } catch (error) {
    console.error("Error deleting transaction:", error);
    res.status(500).json({ message: "We couldn't delete this transaction right now. Please try again." });
  }
};


exports.getAllTransactions = async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 20;
    const offset = (page - 1) * limit;

    const where =
      String(req.user.role).toLowerCase() === "admin"
        ? {}
        : { userId: req.user.id };
    const { count, rows } = await Transaction.findAndCountAll({
      where,
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
    res.status(500).json({ message: "We couldn't load transactions right now. Please try again." });
  }
};
 