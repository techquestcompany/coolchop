const { Model } = require("sequelize");

module.exports = (sequelize, DataTypes) => {
  class Rating extends Model {
    static associate(models) {
      Rating.belongsTo(models.User, {
        foreignKey: "userId",
        as: "user",
        onDelete: "CASCADE",
        onUpdate: "CASCADE",
      });

      Rating.belongsTo(models.Restaurant, {
        foreignKey: "restaurantId",
        as: "restaurant",
        onDelete: "SET NULL",
        onUpdate: "CASCADE",
      });

      Rating.belongsTo(models.Dish, {
        foreignKey: "dishId",
        as: "dish",
        onDelete: "SET NULL",
        onUpdate: "CASCADE",
      });
    }
  }

  Rating.init(
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

      rating: {
        type: DataTypes.FLOAT,
        allowNull: false,
        validate: { min: 0, max: 5 },
      },

      userRating: {
        type: DataTypes.INTEGER,
        allowNull: false,
      },
    },
    {
      sequelize,
      modelName: "Rating",
      timestamps: true,
    }
  );

  return Rating;
};
