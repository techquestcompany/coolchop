"use strict";

const { Model } = require("sequelize");

module.exports = (sequelize, DataTypes) => {
  class NotificationOutbox extends Model {}

  NotificationOutbox.init(
    {
      id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true,
      },
      dedupeKey: {
        type: DataTypes.STRING(191),
        allowNull: false,
        unique: true,
      },
      eventType: {
        type: DataTypes.STRING(100),
        allowNull: false,
      },
      payload: {
        type: DataTypes.JSON,
        allowNull: false,
      },
      status: {
        type: DataTypes.ENUM("pending", "processing", "sent", "failed"),
        allowNull: false,
        defaultValue: "pending",
      },
      attemptCount: {
        type: DataTypes.INTEGER,
        allowNull: false,
        defaultValue: 0,
      },
      nextAttemptAt: {
        type: DataTypes.DATE,
        allowNull: false,
        defaultValue: DataTypes.NOW,
      },
      lockedAt: {
        type: DataTypes.DATE,
        allowNull: true,
      },
      lastError: {
        type: DataTypes.TEXT,
        allowNull: true,
      },
    },
    {
      sequelize,
      modelName: "NotificationOutbox",
      tableName: "NotificationOutbox",
      timestamps: true,
      indexes: [
        { fields: ["status", "nextAttemptAt"] },
        { fields: ["status", "lockedAt"] },
      ],
    }
  );

  return NotificationOutbox;
};
