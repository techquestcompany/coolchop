const { Model } = require("sequelize");

module.exports = (sequelize, DataTypes) => {
  class User extends Model {
    static associate(models) {
      // User has many Orders
      User.hasMany(models.Order, {
        foreignKey: "userId",
        as: "orders",
      });

      // User has many Ratings
      User.hasMany(models.Rating, {
        foreignKey: "userId",
        as: "ratings",
      });

      // User has many Reviews
      User.hasMany(models.Review, {
        foreignKey: "userId",
        as: "reviews",
      });

      // User has many Cart items
      User.hasMany(models.Cart, {
        foreignKey: "userId",
        as: "cartItems",
      });

      // User has many Transactions
      User.hasMany(models.Transaction, {
        foreignKey: "userId",
        as: "transactions",
      });
    }
  }

  User.init(
    {
      id: {
        type: DataTypes.INTEGER,
        autoIncrement: true,
        primaryKey: true,
      },

      name: {
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

      password: {
        type: DataTypes.STRING,
        allowNull: false,
      },

      profileImage: {
        type: DataTypes.STRING,
        allowNull: true,
      },

      code: {
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

      isAdmin: {
        type: DataTypes.BOOLEAN,
        allowNull: false,
        defaultValue: false,
      },

      role: {
        type: DataTypes.STRING,
        allowNull: false,
        defaultValue: "user",
      },

      resetToken: {
        type: DataTypes.STRING,
        allowNull: true,
      },

      tokenExpiry: {
        type: DataTypes.DATE,
        allowNull: true,
      },

      isVerified: {
        type: DataTypes.BOOLEAN,
        allowNull: false,
        defaultValue: false,
      },
    },
    {
      sequelize,
      modelName: "User",
      tableName: "Users",
      timestamps: true,
    }
  );

  return User;
};
