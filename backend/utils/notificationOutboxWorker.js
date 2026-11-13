"use strict";

const cron = require("node-cron");
const { Op } = require("sequelize");
const {
  NotificationOutbox,
  Order,
  RiderPushToken,
  User,
  sequelize,
} = require("../models");
const { sendOrderConfirmation } = require("./mail");

const BATCH_SIZE = 20;
const MAX_ATTEMPTS = 10;
const STALE_LOCK_MS = 10 * 60 * 1000;

let scheduledTask;
let workerRunning = false;

const claimEvent = async () =>
  sequelize.transaction(async (transaction) => {
    const now = new Date();
    const event = await NotificationOutbox.findOne({
      where: {
        [Op.or]: [
          { status: "pending", nextAttemptAt: { [Op.lte]: now } },
          {
            status: "processing",
            lockedAt: { [Op.lte]: new Date(now.getTime() - STALE_LOCK_MS) },
          },
        ],
      },
      order: [["createdAt", "ASC"]],
      transaction,
      lock: transaction.LOCK.UPDATE,
      skipLocked: true,
    });
    if (!event) return null;

    await event.update(
      {
        status: "processing",
        attemptCount: event.attemptCount + 1,
        lockedAt: now,
      },
      { transaction }
    );
    return { id: event.id, eventType: event.eventType, payload: event.payload, attemptCount: event.attemptCount + 1 };
  });

const sendOrderConfirmed = async (payload) => {
  const user = await User.findByPk(payload.userId);
  if (user?.email) {
    await sendOrderConfirmation(user.email, payload.reference, payload.amount);
  }
};

const sendRiderOrderReady = async (payload) => {
  const order = await Order.findOne({
    attributes: ["id"],
    where: {
      id: payload.orderId,
      status: "ready_for_pickup",
      riderId: null,
    },
  });
  if (!order) return;

  const riders = await User.findAll({
    attributes: ["id"],
    where: { role: "rider" },
  });
  if (riders.length === 0) {
    throw new Error("No rider accounts are available for this order notification.");
  }

  const tokens = await RiderPushToken.findAll({
    attributes: ["token"],
    where: { userId: { [Op.in]: riders.map(({ id }) => id) } },
  });
  if (tokens.length === 0) {
    throw new Error("No riders have registered a push notification device yet.");
  }

  const tokenValues = tokens.map(({ token }) => token);
  for (let offset = 0; offset < tokenValues.length; offset += 100) {
    const batch = tokenValues.slice(offset, offset + 100);
    const response = await fetch("https://exp.host/--/api/v2/push/send", {
      method: "POST",
      headers: {
        Accept: "application/json",
        "Accept-Encoding": "gzip, deflate",
        "Content-Type": "application/json",
      },
      body: JSON.stringify(
        batch.map((token) => ({
          to: token,
          title: "Order ready for pickup",
          body: `Order ${payload.orderNumber} is ready. Open Coolchop to claim it.`,
          sound: "default",
          priority: "high",
          channelId: "orders",
          data: {
            type: "rider_order_ready",
            orderId: payload.orderId,
            orderNumber: payload.orderNumber,
          },
        }))
      ),
      signal: AbortSignal.timeout(15000),
    });

    const result = await response.json();
    if (!response.ok || !Array.isArray(result?.data) || result.data.length !== batch.length) {
      throw new Error(`Expo push service returned HTTP ${response.status}.`);
    }

    const retryErrors = [];
    for (let index = 0; index < result.data.length; index += 1) {
      const ticket = result.data[index];
      if (ticket.status === "ok") continue;
      if (ticket.details?.error === "DeviceNotRegistered") {
        await RiderPushToken.destroy({ where: { token: batch[index] } });
      } else {
        retryErrors.push(ticket.message || ticket.details?.error || "Push delivery failed.");
      }
    }
    if (retryErrors.length > 0) {
      throw new Error(retryErrors.slice(0, 3).join("; "));
    }
  }
};

const processEvent = async (event) => {
  switch (event.eventType) {
    case "order_confirmed":
      await sendOrderConfirmed(event.payload);
      return;
    case "rider_order_ready":
      await sendRiderOrderReady(event.payload);
      return;
    default:
      throw new Error(`Unsupported notification event type: ${event.eventType}`);
  }
};

const processOutboxBatch = async () => {
  if (workerRunning) return;
  workerRunning = true;
  try {
    for (let i = 0; i < BATCH_SIZE; i += 1) {
      const event = await claimEvent();
      if (!event) break;

      try {
        await processEvent(event);
        await NotificationOutbox.update(
          { status: "sent", lockedAt: null, lastError: null },
          { where: { id: event.id, status: "processing" } }
        );
      } catch (error) {
        const permanentlyFailed = event.attemptCount >= MAX_ATTEMPTS;
        const retryDelayMinutes = Math.min(60, 2 ** Math.min(event.attemptCount, 6));
        await NotificationOutbox.update(
          {
            status: permanentlyFailed ? "failed" : "pending",
            nextAttemptAt: new Date(Date.now() + retryDelayMinutes * 60 * 1000),
            lockedAt: null,
            lastError: String(error.message || error).slice(0, 2000),
          },
          { where: { id: event.id, status: "processing" } }
        );
        console.error(`Notification outbox event ${event.id} failed:`, error.message);
      }
    }
  } catch (error) {
    console.error("Notification outbox worker failed:", error.message);
  } finally {
    workerRunning = false;
  }
};

exports.startNotificationOutboxWorker = () => {
  if (scheduledTask) return;
  scheduledTask = cron.schedule("* * * * *", processOutboxBatch);
  void processOutboxBatch();
};

exports.stopNotificationOutboxWorker = () => {
  if (scheduledTask) {
    scheduledTask.stop();
    scheduledTask = undefined;
  }
};
