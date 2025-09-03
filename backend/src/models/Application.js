module.exports = (sequelize, DataTypes) => {
  const Application = sequelize.define('Application', {
    id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true,
    },
    companyId: {
      type: DataTypes.UUID,
      allowNull: false,
      field: 'company_id',
      references: {
        model: 'users',
        key: 'id'
      }
    },
    consultantId: {
      type: DataTypes.UUID,
      allowNull: true,
      field: 'consultant_id',
      references: {
        model: 'users',
        key: 'id'
      }
    },
    status: {
      type: DataTypes.ENUM(
        'pending_assignment',
        'in_progress', 
        'document_review',
        'completed',
        'submitted',
        'rejected'
      ),
      allowNull: false,
      defaultValue: 'pending_assignment',
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
    tableName: 'applications',
    timestamps: true,
    createdAt: 'createdAt',
    updatedAt: 'updatedAt'
  });

  Application.associate = function(models) {
    // Belongs to Company User
    Application.belongsTo(models.User, {
      foreignKey: 'companyId',
      as: 'company'
    });

    // Belongs to Consultant User
    Application.belongsTo(models.User, {
      foreignKey: 'consultantId',
      as: 'consultant'
    });

    // Many-to-many with Incentives
    Application.belongsToMany(models.Incentive, {
      through: 'ApplicationIncentives',
      foreignKey: 'applicationId',
      otherKey: 'incentiveId',
      as: 'incentives'
    });

    // One-to-many with UploadedDocuments
    Application.hasMany(models.UploadedDocument, {
      foreignKey: 'applicationId',
      as: 'uploadedDocuments'
    });

    // One-to-many with Messages
    Application.hasMany(models.Message, {
      foreignKey: 'conversationId',
      scope: { conversationType: 'application' },
      as: 'messages'
    });
  };

  return Application;
};