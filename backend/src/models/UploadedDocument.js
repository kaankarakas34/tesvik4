module.exports = (sequelize, DataTypes) => {
  const UploadedDocument = sequelize.define('UploadedDocument', {
    id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true,
    },
    applicationId: {
      type: DataTypes.UUID,
      allowNull: true,
      field: 'application_id',
      references: {
        model: 'applications',
        key: 'id'
      }
    },
    uploaderId: {
      type: DataTypes.UUID,
      allowNull: false,
      field: 'uploader_id',
      references: {
        model: 'users',
        key: 'id'
      }
    },
    originalDocumentId: {
      type: DataTypes.INTEGER,
      allowNull: true,
      field: 'original_document_id',
      references: {
        model: 'documents',
        key: 'id'
      }
    },
    fileName: {
      type: DataTypes.STRING,
      allowNull: false,
      field: 'file_name'
    },
    filePath: {
      type: DataTypes.STRING,
      allowNull: false,
      field: 'file_path'
    },
    fileSize: {
      type: DataTypes.INTEGER,
      allowNull: true,
      field: 'file_size'
    },
    mimeType: {
      type: DataTypes.STRING,
      allowNull: true,
      field: 'mime_type'
    },
    createdAt: {
      type: DataTypes.DATE,
      allowNull: false,
      field: 'created_at'
    }
  }, {
    tableName: 'uploaded_documents',
    timestamps: true,
    createdAt: 'createdAt',
    updatedAt: false
  });

  UploadedDocument.associate = function(models) {
    // Belongs to Application
    UploadedDocument.belongsTo(models.Application, {
      foreignKey: 'applicationId',
      as: 'application'
    });

    // Belongs to User (uploader)
    UploadedDocument.belongsTo(models.User, {
      foreignKey: 'uploaderId',
      as: 'uploader'
    });

    // Belongs to Document (original document type)
    UploadedDocument.belongsTo(models.Document, {
      foreignKey: 'originalDocumentId',
      as: 'originalDocument'
    });
  };

  return UploadedDocument;
};