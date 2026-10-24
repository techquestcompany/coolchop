const cron = require("node-cron");
const { Op } = require("sequelize");
const { Order } = require("../models");
const {
  verifyPaystackReference,
} = require("../controllers/paymentReconciliationController");
const {
  recordFailedPayment,
  recordSuccessfulPayment,
} = require("../controllers/paystackWebhookController");

const BATCH_SIZE = 25;
const MINIMUM_ORDER_AGE_MS = 10 * 60 * 1000;
const RETRY_INTERVAL_MS = 15 * 60 * 1000;
const MAX_RECONCILIATION_AGE_MS = 48 * 60 * 60 * 1000;

let scheduledTask;
let reconciliationRunning = false;

const reconcilePendingPayments = async () => {
  if (!process.env.PAYSTACK_SECRET_KEY || reconciliationRunning) return;
  reconciliationRunning = true;

  try {
    const now = new Date();
    const orders = await Order.findAll({
      where: {
        status: "pending",
        reference: { [Op.ne]: null },
        [Op.and]: [
          { createdAt: { [Op.lte]: new Date(now.getTime() - MINIMUM_ORDER_AGE_MS) } },
          { createdAt: { [Op.gte]: new Date(now.getTime() - MAX_RECONCILIATION_AGE_MS) } },
        ],
        [Op.or]: [
          { reconciliationAttemptedAt: null },
          {
            reconciliationAttemptedAt: {
              [Op.lte]: new Date(now.getTime() - RETRY_INTERVAL_MS),
            },
          },
        ],
      },
      order: [["createdAt", "ASC"]],
      limit: BATCH_SIZE,
    });

    for (const order of orders) {
      try {
        const verification = await verifyPaystackReference(order.reference);
        const payment = verification?.data;
        if (!verification?.status || payment?.reference !== order.reference) {
          throw new Error("Paystack response did not match the pending order");
        }

        if (payment.status === "success") {
          const result = await recordSuccessfulPayment(payment, verification);
          if (result.invalidEvent || result.invalidAmount) {
            console.error(`Payment recovery rejected mismatched details for order ${order.id}`);
          }
        } else if (payment.status === "failed" || payment.status === "abandoned") {
          const result = await recordFailedPayment(payment, verification);
          if (result.invalidEvent || result.invalidAmount) {
            console.error(`Payment recovery rejected mismatched details for order ${order.id}`);
          }
        }
      } catch (error) {
        console.error(`Payment recovery failed for order ${order.id}:`, error.message);
      } finally {
        await order.update({ reconciliationAttemptedAt: new Date() });
      }
    }
  } catch (error) {
    console.error("Pending payment reconciliation failed:", error.message);
  } finally {
    reconciliationRunning = false;
  }
};

exports.startPendingPaymentReconciler = () => {
  if (scheduledTask || !process.env.PAYSTACK_SECRET_KEY) return;
  scheduledTask = cron.schedule("*/5 * * * *", reconcilePendingPayments);
  void reconcilePendingPayments();
};

exports.stopPendingPaymentReconciler = () => {
  if (scheduledTask) {
    scheduledTask.stop();
    scheduledTask = undefined;
  }
};
