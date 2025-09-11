module.exports = (sequelize, DataTypes) => {
  const IncentiveRequiredDocuments = sequelize.define('IncentiveRequiredDocuments', {
    id: {
      type: DataTypes.INTEGER,
      autoIncrement: true,
      primaryKey: true,
    },
    incentiveId: {
      type: DataTypes.INTEGER,
      allowNull: false,
      field: 'incentive_id',
      references: {
        model: 'incentives',
        key: 'id'
      }
    },
    documentId: {
      type: DataTypes.INTEGER,
      allowNull: false,
      field: 'document_id',
      references: {
        model: 'documents',
        key: 'id'
      }
    },
    createdAt: {
      type: DataTypes.DATE,
      allowNull: false,
      field: 'created_at'
    },
    updatedAt: {
      type: DataTypes.DATE,
      allowNull: false,
      field: 'updated_at'
    }
  }, {
    tableName: 'incentive_required_documents',
    timestamps: true,
    createdAt: 'createdAt',
    updatedAt: 'updatedAt',
    indexes: [
      {
        unique: true,
        fields: ['incentive_id', 'document_id'],
        name: 'unique_incentive_document'
      }
    ]
  });

  IncentiveRequiredDocuments.associate = function(models) {
    // Belongs to Incentive
    IncentiveRequiredDocuments.belongsTo(models.Incentive, {
      foreignKey: 'incentiveId',
      as: 'incentive'
    });

    // Belongs to Document
    IncentiveRequiredDocuments.belongsTo(models.Document, {
      foreignKey: 'documentId',
      as: 'document'
    });
  };

  return IncentiveRequiredDocuments;
};