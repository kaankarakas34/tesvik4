module.exports = (sequelize, DataTypes) => {
  const Document = sequelize.define('Document', {
    id: {
      type: DataTypes.INTEGER,
      autoIncrement: true,
      primaryKey: true,
    },
    name: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    description: {
      type: DataTypes.TEXT,
      allowNull: true,
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
    tableName: 'documents',
    timestamps: true,
    createdAt: 'createdAt',
    updatedAt: 'updatedAt'
  });

  Document.associate = function(models) {
    // Many-to-many with Incentives
    Document.belongsToMany(models.Incentive, {
      through: 'IncentiveRequiredDocuments',
      foreignKey: 'documentId',
      otherKey: 'incentiveId',
      as: 'incentives'
    });

    // One-to-many with UploadedDocuments
    Document.hasMany(models.UploadedDocument, {
      foreignKey: 'originalDocumentId',
      as: 'uploadedVersions'
    });
  };

  return Document;
};