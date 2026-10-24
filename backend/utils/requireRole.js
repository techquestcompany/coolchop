module.exports = (...allowedRoles) => (req, res, next) => {
  if (!req.user) {
    return res.status(401).json({ error: "Authentication is required." });
  }

  const isAdmin = req.user.isAdmin === true;
  const roleAllowed = allowedRoles.some((role) =>
    role === "admin" ? isAdmin : role === req.user.role
  );
  if (roleAllowed) {
    return next();
  }

  return res.status(403).json({ error: "You are not authorized to perform this action." });
};
