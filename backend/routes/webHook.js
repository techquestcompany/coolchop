const express = require("express");
const crypto = require("crypto");
const { Order, User, Transaction } = require("../models");
const { sendOrderConfirmation } = require("../utils/mail");
const { sendPush } = require("../utils/push");

const router = express.Router();

router.post(
  "/webhook",
  express.raw({ type: "application/json" }), // raw body for signature
  async (req, res) => {
    try {
      const secret = process.env.PAYSTACK_SECRET_KEY;

      if (!req.body) {
        console.error("Raw body missing");
        return res.sendStatus(400);
      }
console.log("Type of req.body:", typeof req.body);
console.log("Is Buffer?", Buffer.isBuffer(req.body));

      // Verify signature
      const hash = crypto
        .createHmac("sha512", secret)
        .update(req.body) // Buffer
        .digest("hex");

      if (hash !== req.headers["x-paystack-signature"]) {
        console.error("Invalid signature");
        return res.sendStatus(401);
      }

      // Parse JSON after signature check
      const event = JSON.parse(req.body.toString());

      if (event.event === "charge.success") {
        const ref = event.data.reference;

        const order = await Order.findOne({ where: { reference: ref } });
        if (!order || order.status === "success") return res.sendStatus(200);

        order.status = "success";
        await order.save();

        // Update or create transaction
        let transaction = await Transaction.findOne({ where: { orderId: order.id } });
        if (transaction) {
          transaction.status = "success";
          transaction.amount = order.totalAmount;
          transaction.rawResponse = event;
          await transaction.save();
        } else {
          transaction = await Transaction.create({
            orderId: order.id,
            userId: order.userId,
            amount: order.totalAmount,
            status: "success",
            rawResponse: event,
          });
        }

        // Notify user
        const user = await User.findByPk(order.userId);
        if (user?.email) await sendOrderConfirmation(user.email, ref, order.totalAmount);
        if (user?.expoToken) await sendPush(user.expoToken, `Order ${ref} confirmed. Total ₵${order.totalAmount}`);

        // Notify rider
        const rider = await User.findOne({ where: { role: "rider" } });
        if (rider?.expoToken) await sendPush(rider.expoToken, `📦 New order to deliver: Ref ${ref}`);

        console.log(`Order ${ref} and Transaction updated.`);
      }

      return res.sendStatus(200);
    } catch (err) {
      console.error("Webhook error:", err);
      return res.sendStatus(500);
    }
  }
);

module.exports = router;
