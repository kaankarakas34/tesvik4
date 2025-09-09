'use strict';

module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.createTable('IncentiveRequiredDocuments', {
      id: {
        allowNull: false,
        autoIncrement: true,
        primaryKey: true,
        type: Sequelize.INTEGER
      },
      incentiveId: {
        type: Sequelize.INTEGER,
        allowNull: false,
        field: 'incentive_id',
        references: {
          model: 'incentives',
          key: 'id'
        },
        onUpdate: 'CASCADE',
        onDelete: 'CASCADE'
      },
      documentId: {
        type: Sequelize.INTEGER,
        allowNull: false,
        field: 'document_id',
        references: {
          model: 'documents',
          key: 'id'
        },
        onUpdate: 'CASCADE',
        onDelete: 'CASCADE'
      },
      createdAt: {
        allowNull: false,
        type: Sequelize.DATE,
        field: 'created_at'
      },
      updatedAt: {
        allowNull: false,
        type: Sequelize.DATE,
        field: 'updated_at'
      }
    });

    // Add unique constraint to prevent duplicate relationships
    await queryInterface.addIndex('IncentiveRequiredDocuments', {
      fields: ['incentive_id', 'document_id'],
      unique: true,
      name: 'unique_incentive_document'
    });
  },

  down: async (queryInterface, Sequelize) => {
    await queryInterface.dropTable('IncentiveRequiredDocuments');
  }
};