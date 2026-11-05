"use strict";

module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.addColumn("Orders", "riderId", {
      type: Sequelize.INTEGER,
      allowNull: true,
      references: {
        model: "Users",
        key: "id",
      },
      onUpdate: "CASCADE",
      onDelete: "SET NULL",
    });

    await queryInterface.changeColumn("Orders", "status", {
      type: Sequelize.ENUM(
        "pending",
        "preparing",
        "ready_for_pickup",
        "on_delivery",
        "delivered",
        "success",
        "failed",
        "cancelled"
      ),
      allowNull: false,
      defaultValue: "pending",
    });
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.sequelize.query(
      'UPDATE `Orders` SET `status` = \'preparing\' WHERE `status` = \'ready_for_pickup\''
    );
    await queryInterface.changeColumn("Orders", "status", {
      type: Sequelize.ENUM(
        "pending",
        "preparing",
        "on_delivery",
        "delivered",
        "success",
        "failed",
        "cancelled"
      ),
      allowNull: false,
      defaultValue: "pending",
    });
    await queryInterface.removeColumn("Orders", "riderId");
  },
};