'use strict';

module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.addColumn('Dishes', 'profileImage', {
      type: Sequelize.STRING,
      allowNull: true, // image can be null initially
      defaultValue: null,
      after: 'description' // optional: places the column after description
    });
  },

  down: async (queryInterface, Sequelize) => {
    await queryInterface.removeColumn('Dishes', 'profileImage');
  }
};
