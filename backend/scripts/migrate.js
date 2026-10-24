"use strict";

const fs = require("fs");
const path = require("path");
const Sequelize = require("sequelize");
const sequelize = require("../config/db");

const migrationDirectory = path.join(__dirname, "..", "migrations");
const metadataTable = "SequelizeMeta";

const getMigrationNames = () =>
  fs.readdirSync(migrationDirectory)
    .filter((name) => /^\d{14}-.+\.js$/.test(name))
    .sort();

const hasMetadataTable = async (queryInterface) => {
  const tables = await queryInterface.showAllTables();
  return tables.some((table) =>
    String(typeof table === "object" ? table.tableName || table.name : table)
      .toLowerCase()
      .endsWith(metadataTable.toLowerCase())
  );
};

const hasApplicationTables = async (queryInterface) => {
  const tables = await queryInterface.showAllTables();
  return tables.some((table) => {
    const name = String(typeof table === "object" ? table.tableName || table.name : table);
    return name.toLowerCase() !== metadataTable.toLowerCase();
  });
};

const readAppliedMigrations = async (queryInterface) => {
  if (!(await hasMetadataTable(queryInterface))) return [];
  const [rows] = await sequelize.query(`SELECT name FROM \`${metadataTable}\``);
  return rows.map((row) => row.name);
};

const run = async () => {
  const command = process.argv[2] || "up";
  if (!["up", "status"].includes(command)) {
    throw new Error("Usage: node scripts/migrate.js [up|status]");
  }

  const queryInterface = sequelize.getQueryInterface();
  await sequelize.authenticate();
  const allNames = getMigrationNames();
  const appliedNames = await readAppliedMigrations(queryInterface);
  const pendingNames = allNames.filter((name) => !appliedNames.includes(name));

  if (command === "status") {
    if (appliedNames.length === 0 && (await hasApplicationTables(queryInterface))) {
      console.log("Migration history is missing for a non-empty database; no changes made.");
      return;
    }
    console.log(`Applied migrations: ${appliedNames.length}`);
    console.log(pendingNames.length ? "Pending:" : "No pending migrations.");
    pendingNames.forEach((name) => console.log(`  ${name}`));
    return;
  }

  if (appliedNames.length === 0 && (await hasApplicationTables(queryInterface))) {
    throw new Error(
      "Refusing to run migrations against a non-empty database without migration history. " +
        "Verify its schema and establish a migration baseline before retrying."
    );
  }

  if (!(await hasMetadataTable(queryInterface))) {
    await queryInterface.createTable(metadataTable, {
      name: { type: Sequelize.STRING, allowNull: false, primaryKey: true },
    });
  }

  for (const name of pendingNames) {
    const migration = require(path.join(migrationDirectory, name));
    if (typeof migration.up !== "function" || typeof migration.down !== "function") {
      throw new Error(`Migration ${name} must export up and down functions.`);
    }
    console.log(`Applying ${name}`);
    await migration.up(queryInterface, Sequelize);
    await queryInterface.bulkInsert(metadataTable, [{ name }]);
  }
  console.log("Migrations complete.");
};

run()
  .catch((error) => {
    console.error("Migration command failed:", error.message);
    process.exitCode = 1;
  })
  .finally(async () => {
    await sequelize.close();
  });
