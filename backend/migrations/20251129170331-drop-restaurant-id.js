'use strict';

module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.removeColumn('Restaurants', 'restaurantId');
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.addColumn('Restaurants', 'restaurantId', {
      type: Sequelize.STRING,
      allowNull: true
    });
  }
};
