'use strict';

module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.createTable('Carts', {
      id: {
        type: Sequelize.INTEGER,
        autoIncrement: true,
        primaryKey: true,
      },
      userId: {
        type: Sequelize.INTEGER,
        allowNull: false,
      },
      dishId: {
        type: Sequelize.INTEGER,
        allowNull: false,
      },
      quantity: {
        type: Sequelize.INTEGER,
        defaultValue: 1,
      },
      createdAt: {
        type: Sequelize.DATE,
        allowNull: false,
        defaultValue: Sequelize.literal('CURRENT_TIMESTAMP'),
      },
      updatedAt: {
        type: Sequelize.DATE,
        allowNull: false,
        defaultValue: Sequelize.literal('CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP'),
      },
    });

    // Optionally, you can add indexes or foreign keys if Users and Dishes tables exist
    // await queryInterface.addConstraint('Carts', {
    //   fields: ['userId'],
    //   type: 'foreign key',
    //   name: 'fk_cart_user',
    //   references: { table: 'Users', field: 'id' },
    //   onDelete: 'CASCADE',
    //   onUpdate: 'CASCADE',
    // });
    // await queryInterface.addConstraint('Carts', {
    //   fields: ['dishId'],
    //   type: 'foreign key',
    //   name: 'fk_cart_dish',
    //   references: { table: 'Dishes', field: 'id' },
    //   onDelete: 'CASCADE',
    //   onUpdate: 'CASCADE',
    // });
  },

  down: async (queryInterface, Sequelize) => {
    await queryInterface.dropTable('Carts');
  },
};
