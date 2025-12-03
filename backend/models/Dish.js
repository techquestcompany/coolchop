const { Model } = require("sequelize");

module.exports = (sequelize, DataTypes) => {
  class Dish extends Model {
    static associate(models) {
      // Dish → Restaurant
      Dish.belongsTo(models.Restaurant, {
        foreignKey: "restaurantId",
        as: "restaurant",
      });

      
      Dish.hasMany(models.Cart, {
        foreignKey: "dishId",
        as: "cartItems",
      });
    }
  }

  Dish.init(
    {
      id: {
        type: DataTypes.INTEGER,
        autoIncrement: true,
        primaryKey: true,
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

      description: {
        type: DataTypes.TEXT,
        allowNull: false,
      },

      restaurantId: {
        type: DataTypes.INTEGER,
        allowNull: false,
      },

      ratings: {
        type: DataTypes.FLOAT,
        allowNull: false,
        defaultValue: 0,
      },

      reviews: {
        type: DataTypes.INTEGER,
        allowNull: false,
        defaultValue: 0,
      },

      profileImage: {
        type: DataTypes.STRING,
        allowNull: true,
        defaultValue: null,
      },
    },
    {
      sequelize,
      modelName: "Dish",
      timestamps: true,
    }
  );

  return Dish;
};
