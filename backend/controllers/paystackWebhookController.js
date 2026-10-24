const crypto = require("crypto");
const { Cart, Order, Transaction, NotificationOutbox, sequelize } = require("../models");

const isValidSignature = (rawBody, signature, secret) => {
  if (!Buffer.isBuffer(rawBody) || typeof signature !== "string" || !secret) {
    return false;
  }

  const receivedSignature = Buffer.from(signature, "hex");
  const expectedSignature = crypto
    .createHmac("sha512", secret)
    .update(rawBody)
    .digest();

  return (
    receivedSignature.length === expectedSignature.length &&
    crypto.timingSafeEqual(receivedSignature, expectedSignature)
  );
};

const recordSuccessfulPayment = async (data, rawResponse) => {
  const reference = data?.reference;
  const amount = Number(data?.amount);
  const currency = data?.currency;

  if (!reference || !Number.isSafeInteger(amount) || typeof currency !== "string") {
    return { invalidEvent: true };
  }

  const result = await sequelize.transaction(async (dbTransaction) => {
    const order = await Order.findOne({
      where: { reference },
      transaction: dbTransaction,
      lock: dbTransaction.LOCK.UPDATE,
    });

    if (!order) return { notFound: true };

    const expectedAmount = Math.round(Number(order.totalAmount) * 100);
    if (amount !== expectedAmount || currency.toUpperCase() !== "GHS") {
      return { invalidAmount: true };
    }

    let payment = await Transaction.findOne({
      where: { orderId: order.id },
      transaction: dbTransaction,
      lock: dbTransaction.LOCK.UPDATE,
    });

    if (payment?.status === "success") {
      return { alreadyProcessed: true };
    }

    const paymentValues = {
      orderId: order.id,
      userId: order.userId,
      amount,
      status: "success",
      reference,
      currency,
      channel: data.channel || null,
      gatewayResponse: data.gateway_response || null,
      rawResponse,
    };

    if (payment) {
      await payment.update(paymentValues, { transaction: dbTransaction });
    } else {
      await Transaction.create(paymentValues, { transaction: dbTransaction });
    }

    if (["pending", "failed", "cancelled"].includes(order.status)) {
      order.status = "preparing";
      await order.save({ transaction: dbTransaction });
    }

    const orderItems = Array.isArray(order.items) ? order.items : JSON.parse(order.items);
    const quantitiesByDish = new Map();
    for (const item of orderItems) {
      quantitiesByDish.set(
        Number(item.id),
        (quantitiesByDish.get(Number(item.id)) || 0) + Number(item.quantity)
      );
    }

    const cartRows = await Cart.findAll({
      where: { userId: order.userId, dishId: [...quantitiesByDish.keys()] },
      transaction: dbTransaction,
      lock: dbTransaction.LOCK.UPDATE,
    });

    for (const cartRow of cartRows) {
      const remainingQuantity =
        cartRow.quantity - (quantitiesByDish.get(Number(cartRow.dishId)) || 0);
      if (remainingQuantity <= 0) {
        await cartRow.destroy({ transaction: dbTransaction });
      } else {
        cartRow.quantity = remainingQuantity;
        await cartRow.save({ transaction: dbTransaction });
      }
    }

    await NotificationOutbox.create(
      {
        dedupeKey: `order-confirmed:${reference}`,
        eventType: "order_confirmed",
        payload: {
          userId: order.userId,
          reference,
          amount,
        },
      },
      { transaction: dbTransaction }
    );
    return { processed: true };
  });

  return result;
};

const recordFailedPayment = async (data, rawResponse) => {
  const reference = data?.reference;
  const amount = Number(data?.amount);
  const currency = data?.currency;

  if (!reference || !Number.isSafeInteger(amount) || typeof currency !== "string") {
    return { invalidEvent: true };
  }

  return sequelize.transaction(async (dbTransaction) => {
    const order = await Order.findOne({
      where: { reference },
      transaction: dbTransaction,
      lock: dbTransaction.LOCK.UPDATE,
    });
    if (!order) return { notFound: true };

    const expectedAmount = Math.round(Number(order.totalAmount) * 100);
    if (amount !== expectedAmount || currency.toUpperCase() !== "GHS") {
      return { invalidAmount: true };
    }

    let payment = await Transaction.findOne({
      where: { orderId: order.id },
      transaction: dbTransaction,
      lock: dbTransaction.LOCK.UPDATE,
    });
    if (payment?.status === "success") return { alreadyProcessed: true };

    const paymentValues = {
      orderId: order.id,
      userId: order.userId,
      amount,
      status: "failed",
      reference,
      currency,
      channel: data.channel || null,
      gatewayResponse: data.gateway_response || data.message || null,
      rawResponse,
    };

    if (payment) {
      await payment.update(paymentValues, { transaction: dbTransaction });
    } else {
      await Transaction.create(paymentValues, { transaction: dbTransaction });
    }

    if (order.status === "pending") {
      order.status = "failed";
      await order.save({ transaction: dbTransaction });
    }

    return { failed: true };
  });
};

exports.recordSuccessfulPayment = recordSuccessfulPayment;
exports.recordFailedPayment = recordFailedPayment;

exports.handlePaystackWebhook = async (req, res) => {
  if (!isValidSignature(req.body, req.get("x-paystack-signature"), process.env.PAYSTACK_SECRET_KEY)) {
    return res.status(401).json({ error: "Invalid payment signature." });
  }

  let event;
  try {
    event = JSON.parse(req.body.toString("utf8"));
  } catch (error) {
    return res.status(400).json({ error: "Invalid payment event." });
  }

  if (event.event !== "charge.success" && event.event !== "charge.failed") {
    return res.sendStatus(200);
  }

  try {
    const result =
      event.event === "charge.success"
        ? await recordSuccessfulPayment(event.data, event)
        : await recordFailedPayment(event.data, event);
    if (result.notFound) {
      return res.status(404).json({ error: "Order for payment was not found." });
    }
    if (result.invalidEvent || result.invalidAmount) {
      return res.status(400).json({ error: "Payment details did not match an order." });
    }
    return res.sendStatus(200);
  } catch (error) {
    console.error("Paystack webhook processing failed:", error.message);
    return res.sendStatus(500);
  }
};
