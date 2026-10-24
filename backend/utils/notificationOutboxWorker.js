"use strict";

const cron = require("node-cron");
const { Op } = require("sequelize");
const { NotificationOutbox, User, sequelize } = require("../models");
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

const processEvent = async (event) => {
  if (event.eventType !== "order_confirmed") {
    throw new Error(`Unsupported notification event type: ${event.eventType}`);
  }
  await sendOrderConfirmed(event.payload);
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
