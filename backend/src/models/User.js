module.exports = (sequelize, DataTypes) => {
  const User = sequelize.define('User', {
    id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true,
    },
    email: {
      type: DataTypes.STRING,
      allowNull: false,
      unique: true,
      validate: {
        isEmail: true,
      },
    },
    password: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    fullName: {
      type: DataTypes.STRING,
      allowNull: false,
      field: 'full_name'
    },
    companyName: {
      type: DataTypes.STRING,
      allowNull: true,
      field: 'company_name'
    },
    phone: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    role: {
      type: DataTypes.ENUM('admin', 'company', 'consultant'),
      allowNull: false,
      defaultValue: 'company',
    },
    sectorId: {
      type: DataTypes.INTEGER,
      allowNull: true,
      field: 'sector_id',
      references: {
        model: 'sectors',
        key: 'id'
      },
      comment: 'Kullanıcının sektörü'
    },
    status: {
      type: DataTypes.ENUM('pending', 'active', 'inactive'),
      allowNull: false,
      defaultValue: 'pending',
    },
    companyId: {
      type: DataTypes.UUID,
      allowNull: true,
      field: 'company_id',
      comment: 'Şirket üyeliği için - aynı şirkete ait kullanıcılar'
    },
    refreshToken: {
      type: DataTypes.TEXT,
      allowNull: true,
      field: 'refresh_token'
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
    tableName: 'users',
    timestamps: true,
    createdAt: 'createdAt',
    updatedAt: 'updatedAt'
  });

  User.associate = function(models) {
    // Sector relationship
    User.belongsTo(models.Sector, {
      foreignKey: 'sectorId',
      as: 'sector'
    });

    // Company membership - self-referencing relationship
    User.belongsTo(models.User, {
      foreignKey: 'companyId',
      as: 'parentCompany'
    });

    User.hasMany(models.User, {
      foreignKey: 'companyId',
      as: 'companyMembers'
    });

    // Company applications
    User.hasMany(models.Application, {
      foreignKey: 'companyId',
      as: 'companyApplications',
      scope: { role: 'company' }
    });

    // Consultant applications
    User.hasMany(models.Application, {
      foreignKey: 'consultantId',
      as: 'consultantApplications'
    });

    // User tickets
    User.hasMany(models.Ticket, {
      foreignKey: 'userId',
      as: 'userTickets'
    });

    // Assigned tickets (for consultants/admins)
    User.hasMany(models.Ticket, {
      foreignKey: 'assignedTo',
      as: 'assignedTickets'
    });

    // Messages sent by user - Removed to avoid foreign key constraints

    // Posts authored by user
    User.hasMany(models.Post, {
      foreignKey: 'authorId',
      as: 'authoredPosts'
    });

    // Documents uploaded by user
    User.hasMany(models.UploadedDocument, {
      foreignKey: 'uploaderId',
      as: 'uploadedDocuments'
    });
  };

  // Instance methods
  User.prototype.toJSON = function() {
    const values = { ...this.get() };
    delete values.password;
    delete values.refreshToken;
    return values;
  };

  return User;
};