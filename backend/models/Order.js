const { DataTypes } = require('sequelize');
const sequelize = require('../config/db');
const User = require("./User");
const Cart = require("./Cart");

const Order = sequelize.define("Order", {
  orderNumber: {
    type: DataTypes.STRING,
    allowNull: false,
    unique: true,
  },
  totalAmount: {
    type: DataTypes.FLOAT,
    allowNull: false,
  },
  status: {
    type: DataTypes.ENUM('pending', 'preparing', 'on_delivery', 'delivered'),
    defaultValue: 'pending',
  },
  suggestions: {
    type: DataTypes.STRING,
    allowNull: true, 
  },
  userId: {
    type: DataTypes.INTEGER,
    allowNull: false,
  },
  cartId: {
    type: DataTypes.INTEGER,
    allowNull: false,
  }
});

// Establishing associations
Order.belongsTo(User, {
  foreignKey: 'userId',
  as: 'customer',
});

Order.belongsTo(Cart, {
  foreignKey: 'cartId',
  as: 'cart',
});

module.exports = Order;
