const { Model } = require("sequelize");

module.exports = (sequelize, DataTypes) => {
  class Review extends Model {
    static associate(models) {
      Review.belongsTo(models.User, {
        foreignKey: "userId",
        as: "user",
      });

      Review.belongsTo(models.Restaurant, {
        foreignKey: "restaurantId",
        as: "restaurant",
      });

      Review.belongsTo(models.Dish, {
        foreignKey: "dishId",
        as: "dish",
      });
    }
  }

  Review.init(
    {
      id: {
        type: DataTypes.INTEGER,
        autoIncrement: true,
        primaryKey: true,
      },

      userId: {
        type: DataTypes.INTEGER,
        allowNull: false,
      },

      restaurantId: {
        type: DataTypes.INTEGER,
        allowNull: true,
      },

      dishId: {
        type: DataTypes.INTEGER,
        allowNull: true,
      },

      review: {
        type: DataTypes.TEXT,
        allowNull: false,
      },
    },
    {
      sequelize,
      modelName: "Review",
      timestamps: true,
    }
  );

  return Review;
};
