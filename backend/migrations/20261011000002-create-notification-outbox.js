"use strict";

module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable("NotificationOutbox", {
      id: {
        type: Sequelize.INTEGER,
        primaryKey: true,
        autoIncrement: true,
        allowNull: false,
      },
      dedupeKey: {
        type: Sequelize.STRING(191),
        allowNull: false,
        unique: true,
      },
      eventType: {
        type: Sequelize.STRING(100),
        allowNull: false,
      },
      payload: {
        type: Sequelize.JSON,
        allowNull: false,
      },
      status: {
        type: Sequelize.ENUM("pending", "processing", "sent", "failed"),
        allowNull: false,
        defaultValue: "pending",
      },
      attemptCount: {
        type: Sequelize.INTEGER,
        allowNull: false,
        defaultValue: 0,
      },
      nextAttemptAt: {
        type: Sequelize.DATE,
        allowNull: false,
        defaultValue: Sequelize.literal("CURRENT_TIMESTAMP"),
      },
      lockedAt: {
        type: Sequelize.DATE,
        allowNull: true,
      },
      lastError: {
        type: Sequelize.TEXT,
        allowNull: true,
      },
      createdAt: {
        type: Sequelize.DATE,
        allowNull: false,
        defaultValue: Sequelize.literal("CURRENT_TIMESTAMP"),
      },
      updatedAt: {
        type: Sequelize.DATE,
        allowNull: false,
        defaultValue: Sequelize.literal("CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP"),
      },
    });
  },

  async down(queryInterface) {
    await queryInterface.dropTable("NotificationOutbox");
  },
};
