"use strict";

const fs = require("fs");
const path = require("path");

const assertSchemaUpToDate = async (sequelize) => {
  const metadataTable = "SequelizeMeta";
  const migrationDirectory = path.join(__dirname, "..", "migrations");
  const migrationNames = fs.readdirSync(migrationDirectory)
    .filter((name) => /^\d{14}-.+\.js$/.test(name))
    .sort();
  const tables = await sequelize.getQueryInterface().showAllTables();
  const hasMetadataTable = tables.some((table) =>
    String(typeof table === "object" ? table.tableName || table.name : table)
      .toLowerCase()
      .endsWith(metadataTable.toLowerCase())
  );

  if (!hasMetadataTable) {
    throw new Error("Database migration history is missing; run the reviewed migration process.");
  }

  const [rows] = await sequelize.query(`SELECT name FROM \`${metadataTable}\``);
  const applied = new Set(rows.map((row) => row.name));
  const pending = migrationNames.filter((name) => !applied.has(name));
  if (pending.length > 0) {
    throw new Error(`Database migrations are pending: ${pending.join(", ")}`);
  }
};

module.exports = { assertSchemaUpToDate };
