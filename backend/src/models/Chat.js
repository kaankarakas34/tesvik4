module.exports = (sequelize, DataTypes) => {
const Chat = sequelize.define('Chat', {
  id: {
    type: DataTypes.UUID,
    defaultValue: DataTypes.UUIDV4,
    primaryKey: true
  },
  applicationId: {
    type: DataTypes.UUID,
    allowNull: false,
    index: true
  },
  userId: {
    type: DataTypes.UUID,
    allowNull: false
  },
  consultantId: {
    type: DataTypes.UUID,
    allowNull: true
  },
  status: {
    type: DataTypes.ENUM('active', 'paused', 'closed'),
    defaultValue: 'active'
  },
  title: {
    type: DataTypes.STRING,
    allowNull: false
  },
  lastMessageAt: {
    type: DataTypes.DATE,
    defaultValue: DataTypes.NOW
  }
}, {
  tableName: 'chats',
  timestamps: true
});

  Chat.associate = function(models) {
    // Belongs to Application
    Chat.belongsTo(models.Application, {
      foreignKey: 'applicationId',
      as: 'chatApplication'
    });

    // Belongs to User (company)
    Chat.belongsTo(models.User, {
      foreignKey: 'userId',
      as: 'chatUser'
    });

    // Belongs to User (consultant)
    Chat.belongsTo(models.User, {
      foreignKey: 'consultantId',
      as: 'chatConsultant'
    });

    // Has many Messages - Removed to avoid foreign key constraints
  };

  return Chat;
};