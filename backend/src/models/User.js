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
    sector: {
      type: DataTypes.STRING,
      allowNull: true,
      comment: 'Danışman için uzmanlık sektörü'
    },
    status: {
      type: DataTypes.ENUM('pending', 'active', 'inactive'),
      allowNull: false,
      defaultValue: 'pending',
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

    // Messages sent by user
    User.hasMany(models.Message, {
      foreignKey: 'senderId',
      as: 'sentMessages'
    });

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