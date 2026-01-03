export async function up(queryInterface, Sequelize) {
  await queryInterface.changeColumn('Orders', 'status', {
    type: Sequelize.ENUM(
      'pending',
      'preparing',
      'on_delivery',
      'delivered',
      'success',
      'failed'
    ),
    allowNull: false,
    defaultValue: 'pending'
  });
}

export async function down(queryInterface, Sequelize) {
  await queryInterface.changeColumn('Orders', 'status', {
    type: Sequelize.ENUM(
      'pending',
      'preparing',
      'on_delivery',
      'delivered'
    ),
    allowNull: false,
    defaultValue: 'pending'
  });
}

