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
    amount: {
      type: DataTypes.DECIMAL(15, 2),
      allowNull: true,
      defaultValue: 0
    },
    type: {
      type: DataTypes.STRING,
      allowNull: true,
      defaultValue: 'grant'
    },
    sectorId: {
      type: DataTypes.INTEGER,
      allowNull: true,
      field: 'sector_id',
      references: {
        model: 'sectors',
        key: 'id'
      },
      comment: 'Teşviğin ait olduğu sektör'
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
    // Sector relationship
    Incentive.belongsTo(models.Sector, {
      foreignKey: 'sectorId',
      as: 'sector'
    });

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
      foreignKey: 'incentive_id',
      otherKey: 'application_id',
      as: 'applications'
    });
  };

  return Incentive;
};