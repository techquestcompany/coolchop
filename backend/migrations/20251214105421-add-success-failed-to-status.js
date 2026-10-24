"use strict";

module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.changeColumn("Orders", "status", {
      type: Sequelize.ENUM(
        "pending",
        "preparing",
        "on_delivery",
        "delivered",
        "success",
        "failed"
      ),
      allowNull: false,
      defaultValue: "pending",
    });
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.changeColumn("Orders", "status", {
      type: Sequelize.ENUM("pending", "preparing", "on_delivery", "delivered"),
      allowNull: false,
      defaultValue: "pending",
    });
  },
};
