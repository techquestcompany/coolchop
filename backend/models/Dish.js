const { DataTypes } = require('sequelize');
const sequelize = require('../config/db');

const Dish = sequelize.define('Dish', {
  id: {
    type: DataTypes.UUID,
    defaultValue: DataTypes.UUIDV4,
    primaryKey: true,
  },
  profileImage: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  dishName: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  price: {
    type: DataTypes.DECIMAL(10, 2), 
    allowNull: false,
  },
  category: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  ingredients: {
    type: DataTypes.TEXT, 
    allowNull: false,
  },
  restaurantId: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  createdAt: {
  type: DataTypes.DATE,
  allowNull: false,
  defaultValue: DataTypes.NOW,
},
updatedAt: {
  type: DataTypes.DATE,
  allowNull: false,
  defaultValue: DataTypes.NOW,
},

}, {});

module.exports = Dish;
