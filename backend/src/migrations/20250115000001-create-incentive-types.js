'use strict';

module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.createTable('incentive_types', {
      id: {
        allowNull: false,
        autoIncrement: true,
        primaryKey: true,
        type: Sequelize.INTEGER
      },
      name: {
        type: Sequelize.STRING(100),
        allowNull: false
      },
      description: {
        type: Sequelize.TEXT,
        allowNull: true
      },
      sector_id: {
        type: Sequelize.INTEGER,
        allowNull: true,
        references: {
          model: 'sectors',
          key: 'id'
        },
        onUpdate: 'CASCADE',
        onDelete: 'SET NULL'
      },
      category: {
        type: Sequelize.ENUM('vergi_tesviki', 'subvansiyon', 'kredi_destegi', 'hibe', 'istihdam_destegi', 'ar_ge_destegi', 'ihracat_destegi', 'yatirim_destegi', 'diger'),
        allowNull: false,
        defaultValue: 'diger'
      },
      is_active: {
        type: Sequelize.BOOLEAN,
        allowNull: false,
        defaultValue: true
      },
      priority: {
        type: Sequelize.INTEGER,
        allowNull: false,
        defaultValue: 0
      },
      created_at: {
        allowNull: false,
        type: Sequelize.DATE,
        defaultValue: Sequelize.literal('CURRENT_TIMESTAMP')
      },
      updated_at: {
        allowNull: false,
        type: Sequelize.DATE,
        defaultValue: Sequelize.literal('CURRENT_TIMESTAMP')
      }
    });

    // Add indexes
    await queryInterface.addIndex('incentive_types', ['sector_id']);
    await queryInterface.addIndex('incentive_types', ['category']);
    await queryInterface.addIndex('incentive_types', ['is_active']);
    await queryInterface.addIndex('incentive_types', ['priority']);
  },

  down: async (queryInterface, Sequelize) => {
    await queryInterface.dropTable('incentive_types');
  }
};