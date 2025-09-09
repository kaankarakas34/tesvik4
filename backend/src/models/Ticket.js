module.exports = (sequelize, DataTypes) => {
  const Ticket = sequelize.define('Ticket', {
    id: {
      type: DataTypes.INTEGER,
      autoIncrement: true,
      primaryKey: true,
    },
    ticketCode: {
      type: DataTypes.STRING(20),
      allowNull: false,
      unique: true,
      field: 'ticket_code'
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
    description: {
      type: DataTypes.TEXT,
      allowNull: false,
    },
    status: {
      type: DataTypes.ENUM('open', 'in_progress', 'resolved', 'closed'),
      allowNull: false,
      defaultValue: 'open',
    },
    priority: {
      type: DataTypes.ENUM('low', 'medium', 'high', 'urgent'),
      allowNull: false,
      defaultValue: 'medium',
    },
    assignedAdminId: {
      type: DataTypes.UUID,
      allowNull: true,
      field: 'assigned_admin_id',
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

    // Belongs to User (assigned admin)
    Ticket.belongsTo(models.User, {
      foreignKey: 'assignedAdminId',
      as: 'assignedAdmin'
    });

    // Has many TicketMessages
    Ticket.hasMany(models.TicketMessage, {
      foreignKey: 'ticketId',
      as: 'messages'
    });
  };

  return Ticket;
};