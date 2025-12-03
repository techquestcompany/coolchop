const { Model } = require("sequelize");

module.exports = (sequelize, DataTypes) => {
  class Order extends Model {
    static associate(models) {
      Order.belongsTo(models.User, {
        foreignKey: "userId",
        as: "user",
      });
      Order.hasMany(models.Transaction, { foreignKey: "orderId", as: "transactions" });

    }
  }

  Order.init(
    {
      id: {
        type: DataTypes.INTEGER,
        autoIncrement: true,
        primaryKey: true,
      },
  
      orderNumber: {
        type: DataTypes.STRING,
        allowNull: false,
        unique: true,
      },

      items: {
        type: DataTypes.JSON,
        allowNull: false,
      },

      totalAmount: {
        type: DataTypes.FLOAT,
        allowNull: false,
      },

      status: {
        type: DataTypes.ENUM("pending", "preparing", "on_delivery", "delivered"),
        allowNull: false,
        defaultValue: "pending",
      },

      note: {
        type: DataTypes.STRING,
        allowNull: true,
      },

      userId: {
        type: DataTypes.INTEGER,
        allowNull: false,
      },
    },
    {
      sequelize,
      modelName: "Order",
      timestamps: true,
    }
  );

  return Order;
};
