const { Model } = require("sequelize");

module.exports = (sequelize, DataTypes) => {
  class Restaurant extends Model {
    static associate(models) {
      // A Restaurant has many Dishes
      Restaurant.hasMany(models.Dish, {
        foreignKey: "restaurantId",
        as: "dishes",
      });

      // A Restaurant can receive many Ratings
      Restaurant.hasMany(models.Rating, {
        foreignKey: "restaurantId",
        as: "ratingsData",
      });
    }
  }

  Restaurant.init(
    {
      id: {
        type: DataTypes.INTEGER,
        autoIncrement: true,
        primaryKey: true,
      },
      restaurantName: {
        type: DataTypes.STRING,
        allowNull: false,
      },

      description: {
        type: DataTypes.STRING,
        allowNull: false,
      },

      email: {
        type: DataTypes.STRING,
        allowNull: false,
        unique: true,
      },

      phone: {
        type: DataTypes.STRING,
        allowNull: false,
        unique: true,
      },

      address: {
        type: DataTypes.STRING,
        allowNull: false,
        unique: true,
      },

      profileImage: {
        type: DataTypes.STRING,
        allowNull: true,
      },

      longitude: {
        type: DataTypes.FLOAT,
        allowNull: true,
      },

      latitude: {
        type: DataTypes.FLOAT,
        allowNull: true,
      },

      confirm_location: {
        type: DataTypes.BOOLEAN,
        allowNull: false,
        defaultValue: false,
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

      isVerified: {
        type: DataTypes.BOOLEAN,
        
        defaultValue: false,
      },
      password: {
      type: DataTypes.STRING,
      allowNull: false,
     }

    },
    {
      sequelize,
      modelName: "Restaurant",
      timestamps: true,
    }
  );

  return Restaurant;
};
