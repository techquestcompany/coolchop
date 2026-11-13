"use strict";

const { Model } = require("sequelize");

module.exports = (sequelize, DataTypes) => {
  class RiderPushToken extends Model {}

  RiderPushToken.init(
    {
      id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true,
      },
      userId: {
        type: DataTypes.INTEGER,
        allowNull: false,
        references: {
          model: "Users",
          key: "id",
        },
        onUpdate: "CASCADE",
        onDelete: "CASCADE",
      },
      token: {
        type: DataTypes.STRING(255),
        allowNull: false,
        unique: true,
      },
      platform: {
        type: DataTypes.ENUM("android", "ios"),
        allowNull: false,
      },
      lastSeenAt: {
        type: DataTypes.DATE,
        allowNull: false,
        defaultValue: DataTypes.NOW,
      },
    },
    {
      sequelize,
      modelName: "RiderPushToken",
      tableName: "RiderPushTokens",
      timestamps: true,
      indexes: [{ fields: ["userId"] }],
    }
  );

  return RiderPushToken;
};
