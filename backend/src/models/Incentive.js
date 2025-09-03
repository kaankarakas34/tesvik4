module.exports = (sequelize, DataTypes) => {
  const Incentive = sequelize.define('Incentive', {
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
    isActive: {
      type: DataTypes.BOOLEAN,
      allowNull: false,
      defaultValue: true,
      field: 'is_active'
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
    tableName: 'incentives',
    timestamps: true,
    createdAt: 'createdAt',
    updatedAt: 'updatedAt'
  });

  Incentive.associate = function(models) {
    // Many-to-many with Documents (required documents)
    Incentive.belongsToMany(models.Document, {
      through: 'IncentiveRequiredDocuments',
      foreignKey: 'incentiveId',
      otherKey: 'documentId',
      as: 'requiredDocuments'
    });

    // Many-to-many with Applications
    Incentive.belongsToMany(models.Application, {
      through: 'ApplicationIncentives',
      foreignKey: 'incentiveId',
      otherKey: 'applicationId',
      as: 'applications'
    });
  };

  return Incentive;
};