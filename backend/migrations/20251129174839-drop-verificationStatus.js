'use strict';

module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.removeColumn('Restaurants', 'verificationStatus');
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.addColumn('Restaurants', 'verificationStatus', {
      type: Sequelize.STRING,
      allowNull: true
    });
  }
};
