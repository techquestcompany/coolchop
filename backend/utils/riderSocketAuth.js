"use strict";

const jwt = require("jsonwebtoken");
const { User } = require("../models");
const { getAdminUserIds } = require("./adminIdentity");

module.exports = async (socket, next) => {
  const token = socket.handshake.auth?.token;
  if (typeof token !== "string" || !process.env.JWT_SECRET) {
    return next(new Error("Rider authentication is required."));
  }

  let decoded;
  try {
    decoded = jwt.verify(token, process.env.JWT_SECRET);
    if (
      !decoded ||
      typeof decoded !== "object" ||
      decoded.role !== "rider" ||
      !Number.isInteger(Number(decoded.id)) ||
      Number(decoded.id) < 1
    ) {
      return next(new Error("Rider access is required."));
    }
  } catch {
    return next(new Error("Rider authentication is invalid or expired."));
  }

  try {
    const riderId = Number(decoded.id);
    const rider = await User.findByPk(riderId, {
      attributes: ["id", "role", "isActive"],
    });
    if (!rider || rider.role !== "rider" || !rider.isActive || getAdminUserIds().has(riderId)) {
      return next(new Error("Rider access is required."));
    }
    socket.data.riderId = riderId;
    return next();
  } catch (error) {
    console.error("Rider socket account lookup failed:", error);
    return next(new Error("Rider authentication is unavailable."));
  }
};
