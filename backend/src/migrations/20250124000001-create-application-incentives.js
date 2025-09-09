'use strict';

module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.createTable('ApplicationIncentives', {
      id: {
        allowNull: false,
        autoIncrement: true,
        primaryKey: true,
        type: Sequelize.INTEGER
      },
      application_id: {
        type: Sequelize.UUID,
        allowNull: false,
        references: {
          model: 'applications',
          key: 'id'
        },
        onUpdate: 'CASCADE',
        onDelete: 'CASCADE'
      },
      incentive_id: {
        type: Sequelize.INTEGER,
        allowNull: false,
        references: {
          model: 'incentives',
          key: 'id'
        },
        onUpdate: 'CASCADE',
        onDelete: 'CASCADE'
      },
      created_at: {
        allowNull: false,
        type: Sequelize.DATE
      },
      updated_at: {
        allowNull: false,
        type: Sequelize.DATE
      }
    });

    // Add unique constraint to prevent duplicate relationships
    await queryInterface.addIndex('ApplicationIncentives', {
      fields: ['application_id', 'incentive_id'],
      unique: true,
      name: 'unique_application_incentive'
    });
  },

  down: async (queryInterface, Sequelize) => {
    await queryInterface.dropTable('ApplicationIncentives');
  }
};