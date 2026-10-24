const getAdminUserIds = () =>
  new Set(
    (process.env.ADMIN_USER_IDS || "")
      .split(",")
      .map((id) => Number(id.trim()))
      .filter((id) => Number.isInteger(id) && id > 0)
  );

module.exports = { getAdminUserIds };
