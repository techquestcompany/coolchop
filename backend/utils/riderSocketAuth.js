"use strict";

const jwt = require("jsonwebtoken");

module.exports = (socket, next) => {
  const token = socket.handshake.auth?.token;
  if (typeof token !== "string" || !process.env.JWT_SECRET) {
    return next(new Error("Rider authentication is required."));
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    if (
      !decoded ||
      typeof decoded !== "object" ||
      decoded.role !== "rider" ||
      !Number.isInteger(Number(decoded.id)) ||
      Number(decoded.id) < 1
    ) {
      return next(new Error("Rider access is required."));
    }
    socket.data.riderId = Number(decoded.id);
    return next();
  } catch {
    return next(new Error("Rider authentication is invalid or expired."));
  }
};
