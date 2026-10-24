require("dotenv").config();
const { Sequelize } = require("sequelize");

const isProduction = process.env.NODE_ENV === "production";
const databaseUrl = process.env.DATABASE_URL;

let sequelize;

if (databaseUrl) {
  sequelize = new Sequelize(databaseUrl, {
    dialect: "mysql",
    logging: false,
    dialectOptions:
      isProduction && process.env.DB_SSL === "true"
        ? { ssl: { rejectUnauthorized: true } }
        : {},
  });
} else {
  const requiredSettings = ["DB_HOST", "DB_NAME", "DB_USER", "DB_PASSWORD"];
  const missingSettings = requiredSettings.filter((name) => !process.env[name]);

  if (missingSettings.length > 0) {
    throw new Error(
      `Missing database configuration: set DATABASE_URL or ${requiredSettings.join(", ")}`
    );
  }

  sequelize = new Sequelize(
    process.env.DB_NAME,
    process.env.DB_USER,
    process.env.DB_PASSWORD,
    {
      host: process.env.DB_HOST,
      port: Number(process.env.DB_PORT || 3306),
      dialect: "mysql",
      logging: !isProduction && process.env.DB_LOGGING === "true" ? console.log : false,
      dialectOptions:
        isProduction && process.env.DB_SSL === "true"
          ? { ssl: { rejectUnauthorized: true } }
          : {},
      pool: {
        max: Number(process.env.DB_POOL_MAX || 10),
        min: Number(process.env.DB_POOL_MIN || 0),
        acquire: Number(process.env.DB_POOL_ACQUIRE_MS || 30000),
        idle: Number(process.env.DB_POOL_IDLE_MS || 10000),
      },
    }
  );
}

module.exports = sequelize;
