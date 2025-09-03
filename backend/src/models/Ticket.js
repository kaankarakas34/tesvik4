module.exports = (sequelize, DataTypes) => {
  const Ticket = sequelize.define('Ticket', {
    id: {
      type: DataTypes.INTEGER,
      autoIncrement: true,
      primaryKey: true,
    },
    userId: {
      type: DataTypes.UUID,
      allowNull: false,
      field: 'user_id',
      references: {
        model: 'users',
        key: 'id'
      }
    },
    title: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    status: {
      type: DataTypes.ENUM('open', 'closed'),
      allowNull: false,
      defaultValue: 'open',
    },
    assignedTo: {
      type: DataTypes.UUID,
      allowNull: true,
      field: 'assigned_to',
      references: {
        model: 'users',
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
    tableName: 'tickets',
    timestamps: true,
    createdAt: 'createdAt',
    updatedAt: 'updatedAt'
  });

  Ticket.associate = function(models) {
    // Belongs to User (creator)
    Ticket.belongsTo(models.User, {
      foreignKey: 'userId',
      as: 'user'
    });

    // Belongs to User (assigned)
    Ticket.belongsTo(models.User, {
      foreignKey: 'assignedTo',
      as: 'assignee'
    });

    // One-to-many with Messages
    Ticket.hasMany(models.Message, {
      foreignKey: 'conversationId',
      scope: { conversationType: 'ticket' },
      as: 'messages'
    });
  };

  return Ticket;
};