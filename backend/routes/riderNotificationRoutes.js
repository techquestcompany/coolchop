"use strict";

const express = require("express");
const tokenMiddleware = require("../utils/tokenAuth");
const requireRole = require("../utils/requireRole");
const {
  registerPushToken,
  removePushToken,
} = require("../controllers/riderNotificationController");

const router = express.Router();

router.post("/rider/push-token", tokenMiddleware, requireRole("rider"), registerPushToken);
router.delete("/rider/push-token", tokenMiddleware, requireRole("rider"), removePushToken);

module.exports = router;
