'use strict';

module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.addColumn('Orders', 'reference', {
      type: Sequelize.STRING,
      unique: true,
      allowNull: true, // allow null initially so old rows don’t break
    });
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.removeColumn('Orders', 'reference');
  }
};

