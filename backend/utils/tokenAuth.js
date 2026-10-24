const jwt = require("jsonwebtoken");
const { getAdminUserIds } = require("./adminIdentity");

module.exports = function (req, res, next) {
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

  jwt.verify(token, process.env.JWT_SECRET, (err, decoded) => {
    if (err) return res.status(403).json({ error: "Invalid or expired token" });

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
    const role = isAdmin
      ? "admin"
      : decoded.role === "restaurant"
        ? "restaurant"
        : decoded.role === "rider"
          ? "rider"
          : "customer";
    req.user = { ...decoded, id, role, isAdmin };
    next();
  });
};
