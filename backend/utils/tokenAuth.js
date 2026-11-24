const jwt = require("jsonwebtoken");
const { getAdminUserIds } = require("./adminIdentity");
const { User, Restaurant } = require("../models");

module.exports = async function (req, res, next) {
  const authHeader = req.get("authorization");

  if (!authHeader) {
    return res.status(401).json({ error: "No token provided" });
  }

  if (!/^Bearer\s+\S+$/i.test(authHeader)) {
    return res.status(401).json({ error: "Invalid token format" });
  }

  const token = authHeader.split(" ")[1]; // Bearer TOKEN

  if (!token) {
    return res.status(401).json({ error: "Invalid token format" });
  }

  if (!process.env.JWT_SECRET) {
    console.error("JWT_SECRET is not configured");
    return res.status(500).json({ error: "Authentication is unavailable" });
  }

  let decoded;
  try {
    decoded = jwt.verify(token, process.env.JWT_SECRET);
  } catch {
    return res.status(403).json({ error: "Invalid or expired token" });
  }

  try {
    if (
      !decoded ||
      typeof decoded !== "object" ||
      !Number.isInteger(Number(decoded.id)) ||
      Number(decoded.id) < 1
    ) {
      return res.status(403).json({ error: "Invalid token claims" });
    }

    const id = Number(decoded.id);
    const isAdmin = getAdminUserIds().has(id);
    if (decoded.role === "restaurant") {
      const restaurant = await Restaurant.findByPk(id, {
        attributes: ["id", "isVerified", "isActive"],
      });
      if (!restaurant || !restaurant.isVerified || !restaurant.isActive) {
        return res.status(403).json({ error: "This restaurant account is not active or approved." });
      }
      req.user = { ...decoded, id, role: "restaurant", isAdmin: false };
      return next();
    }

    const user = await User.findByPk(id, {
      attributes: ["id", "role", "isActive"],
    });
    if (!user || !user.isActive) {
      return res.status(403).json({ error: "This account is not active." });
    }
    const role = isAdmin ? "admin" : user.role === "rider" ? "rider" : "customer";
    req.user = { ...decoded, id, role, isAdmin };
    next();
  } catch (error) {
    console.error("Authentication account lookup failed:", error);
    return res.status(500).json({ error: "Authentication is unavailable." });
  }
};
