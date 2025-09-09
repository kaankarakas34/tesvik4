module.exports = (sequelize, DataTypes) => {
  const Message = sequelize.define('Message', {
    id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true,
    },
    conversationId: {
      type: DataTypes.STRING,
      allowNull: false,
      field: 'conversation_id'
    },
    conversationType: {
      type: DataTypes.ENUM('application', 'ticket'),
      allowNull: false,
      field: 'conversation_type'
    },
    senderId: {
      type: DataTypes.UUID,
      allowNull: false,
      field: 'sender_id'
    },
    senderType: {
      type: DataTypes.ENUM('user', 'consultant', 'system'),
      allowNull: false,
      field: 'sender_type'
    },
    content: {
      type: DataTypes.TEXT,
      allowNull: false,
    },
    messageType: {
      type: DataTypes.ENUM('text', 'file', 'system'),
      defaultValue: 'text',
      field: 'message_type'
    },
    isRead: {
      type: DataTypes.BOOLEAN,
      defaultValue: false,
      field: 'is_read'
    },
    readAt: {
      type: DataTypes.DATE,
      allowNull: true,
      field: 'read_at'
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
    Message.belongsTo(models.User, {
      foreignKey: 'senderId',
      as: 'sender'
    });
  };

  return Message;
};