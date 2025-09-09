module.exports = (sequelize, DataTypes) => {
  const TicketMessage = sequelize.define('TicketMessage', {
    id: {
      type: DataTypes.INTEGER,
      autoIncrement: true,
      primaryKey: true,
    },
    ticketId: {
      type: DataTypes.INTEGER,
      allowNull: false,
      field: 'ticket_id',
      references: {
        model: 'tickets',
        key: 'id'
      }
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
    message: {
      type: DataTypes.TEXT,
      allowNull: false,
    },
    isAdminReply: {
      type: DataTypes.BOOLEAN,
      allowNull: false,
      defaultValue: false,
      field: 'is_admin_reply'
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
    tableName: 'ticket_messages',
    timestamps: true,
    createdAt: 'createdAt',
    updatedAt: 'updatedAt'
  });

  TicketMessage.associate = function(models) {
    // Belongs to Ticket
    TicketMessage.belongsTo(models.Ticket, {
      foreignKey: 'ticketId',
      as: 'ticket'
    });

    // Belongs to User (message sender)
    TicketMessage.belongsTo(models.User, {
      foreignKey: 'userId',
      as: 'user'
    });
  };

  return TicketMessage;
};