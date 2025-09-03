module.exports = (sequelize, DataTypes) => {
  const Message = sequelize.define('Message', {
    id: {
      type: DataTypes.INTEGER,
      autoIncrement: true,
      primaryKey: true,
    },
    conversationId: {
      type: DataTypes.STRING,
      allowNull: false,
      field: 'conversation_id',
      comment: 'UUID for application or ticket ID'
    },
    conversationType: {
      type: DataTypes.ENUM('application', 'ticket'),
      allowNull: false,
      field: 'conversation_type'
    },
    senderId: {
      type: DataTypes.UUID,
      allowNull: false,
      field: 'sender_id',
      references: {
        model: 'users',
        key: 'id'
      }
    },
    content: {
      type: DataTypes.TEXT,
      allowNull: false,
    },
    createdAt: {
      type: DataTypes.DATE,
      allowNull: false,
      field: 'created_at'
    }
  }, {
    tableName: 'messages',
    timestamps: true,
    createdAt: 'createdAt',
    updatedAt: false
  });

  Message.associate = function(models) {
    // Belongs to User (sender)
    Message.belongsTo(models.User, {
      foreignKey: 'senderId',
      as: 'sender'
    });
  };

  return Message;
};