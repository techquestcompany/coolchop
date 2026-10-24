const { Model } = require("sequelize");

module.exports = (sequelize, DataTypes) => {
  class Transaction extends Model {
    static associate(models) {
      Transaction.belongsTo(models.User, {
        foreignKey: "userId",
        as: "user",
      });

      Transaction.belongsTo(models.Order, { foreignKey: "orderId", as: "order" });
    }
  }

  Transaction.init(
    {
      id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true,
      },

      userId: {
        type: DataTypes.INTEGER,
        allowNull: false,
      },

      orderId: {
        type: DataTypes.INTEGER,
        allowNull: true,
      },

      reference: {
        type: DataTypes.STRING,
        allowNull: false,
        unique: true,
      },

      amount: {
        type: DataTypes.INTEGER,
        allowNull: false,
      },

      currency: {
        type: DataTypes.STRING,
        defaultValue: "GHS",
      },

      status: {
        type: DataTypes.STRING,
        allowNull: false,
        defaultValue: "pending",
      },

      channel: {
        type: DataTypes.STRING,
        allowNull: true,
      },

      gatewayResponse: {
        type: DataTypes.STRING,
        allowNull: true,
      },

      rawResponse: {
        type: DataTypes.JSON,
        allowNull: true,
      },
    },
    {
      sequelize,
      modelName: "Transaction",
    }
  );

  return Transaction;
};
