module.exports = (sequelize, DataTypes) => {
  const IncentiveType = sequelize.define('IncentiveType', {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true,
    },
    name: {
      type: DataTypes.STRING(100),
      allowNull: false,
      validate: {
        notEmpty: true,
        len: [2, 100]
      }
    },
    description: {
      type: DataTypes.TEXT,
      allowNull: true,
    },
    sectorId: {
      type: DataTypes.INTEGER,
      allowNull: true,
      field: 'sector_id',
      references: {
        model: 'sectors',
        key: 'id'
      },
      comment: 'Teşvik türünün ait olduğu sektör (null ise genel)'
    },
    category: {
      type: DataTypes.ENUM('vergi_tesviki', 'subvansiyon', 'kredi_destegi', 'hibe', 'istihdam_destegi', 'ar_ge_destegi', 'ihracat_destegi', 'yatirim_destegi', 'diger'),
      allowNull: false,
      defaultValue: 'diger',
      comment: 'Teşvik türü kategorisi'
    },
    isActive: {
      type: DataTypes.BOOLEAN,
      allowNull: false,
      defaultValue: true,
      field: 'is_active'
    },
    priority: {
      type: DataTypes.INTEGER,
      allowNull: false,
      defaultValue: 0,
      comment: 'Sıralama önceliği (yüksek değer önce gösterilir)'
    },
    createdAt: {
      type: DataTypes.DATE,
      allowNull: false,
      defaultValue: DataTypes.NOW,
      field: 'created_at'
    },
    updatedAt: {
      type: DataTypes.DATE,
      allowNull: false,
      defaultValue: DataTypes.NOW,
      field: 'updated_at'
    }
  }, {
    tableName: 'incentive_types',
    timestamps: true,
    underscored: true,
    indexes: [
      {
        fields: ['sector_id']
      },
      {
        fields: ['category']
      },
      {
        fields: ['is_active']
      },
      {
        fields: ['priority']
      }
    ]
  });

  IncentiveType.associate = function(models) {
    // IncentiveType belongs to Sector
    IncentiveType.belongsTo(models.Sector, {
      foreignKey: 'sectorId',
      as: 'sector'
    });

    // IncentiveType has many Incentives
    IncentiveType.hasMany(models.Incentive, {
      foreignKey: 'incentiveTypeId',
      as: 'incentives'
    });
  };

  return IncentiveType;
};