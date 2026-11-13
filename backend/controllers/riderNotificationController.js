"use strict";

const { RiderPushToken } = require("../models");

const isExpoPushToken = (token) =>
  typeof token === "string" &&
  token.length <= 255 &&
  /^(Exponent|Expo)PushToken\[[^\]]+\]$/.test(token);

exports.registerPushToken = async (req, res) => {
  const { token, platform } = req.body || {};
  if (
    !isExpoPushToken(token) ||
    !["android", "ios"].includes(platform) ||
    Object.keys(req.body || {}).some((key) => !["token", "platform"].includes(key))
  ) {
    return res.status(400).json({ message: "Enter a valid Expo push token and platform." });
  }

  try {
    await RiderPushToken.upsert({
      token,
      userId: req.user.id,
      platform,
      lastSeenAt: new Date(),
    });
    return res.status(200).json({ message: "Push token registered." });
  } catch (error) {
    console.error("Error registering rider push token:", error);
    return res.status(500).json({ message: "We couldn't register push notifications right now." });
  }
};

exports.removePushToken = async (req, res) => {
  const { token } = req.body || {};
  if (
    !isExpoPushToken(token) ||
    Object.keys(req.body || {}).some((key) => key !== "token")
  ) {
    return res.status(400).json({ message: "Enter a valid Expo push token." });
  }

  try {
    await RiderPushToken.destroy({
      where: { userId: req.user.id, token },
    });
    return res.status(200).json({ message: "Push token removed." });
  } catch (error) {
    console.error("Error removing rider push token:", error);
    return res.status(500).json({ message: "We couldn't remove this push token right now." });
  }
};
