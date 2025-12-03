'use strict';

module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.addColumn('Transactions', 'orderId', {
      type: Sequelize.INTEGER,
      allowNull: true, // optional: set to false if every transaction must have an order
      references: {
        model: 'Orders', // name of the table
        key: 'id',
      },
      onUpdate: 'CASCADE',
      onDelete: 'SET NULL', // optional, can also be 'CASCADE'
    });
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.removeColumn('Transactions', 'orderId');
  },
};
