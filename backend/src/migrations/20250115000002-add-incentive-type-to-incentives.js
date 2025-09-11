'use strict';

module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.addColumn('incentives', 'incentive_type_id', {
      type: Sequelize.INTEGER,
      allowNull: true,
      references: {
        model: 'incentive_types',
        key: 'id'
      },
      onUpdate: 'CASCADE',
      onDelete: 'SET NULL'
    });

    // Add index for better performance
    await queryInterface.addIndex('incentives', ['incentive_type_id']);
  },

  down: async (queryInterface, Sequelize) => {
    await queryInterface.removeIndex('incentives', ['incentive_type_id']);
    await queryInterface.removeColumn('incentives', 'incentive_type_id');
  }
};