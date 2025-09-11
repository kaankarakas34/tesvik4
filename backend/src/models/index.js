const { Sequelize, DataTypes } = require('sequelize');
const path = require('path');

const env = process.env.NODE_ENV || 'development';
const config = require(path.join(__dirname, '..', 'config', 'database.json'))[env];

let sequelize;
if (process.env.DATABASE_URL) {
  sequelize = new Sequelize(process.env.DATABASE_URL, {
    dialect: 'postgres',
    logging: config.logging || false,
    dialectOptions: {
      ssl: process.env.NODE_ENV === 'production' ? {
        require: true,
        rejectUnauthorized: false
      } : false
    }
  });
} else {
  sequelize = new Sequelize(config.database, config.username, config.password, config);
}

const db = {};

// Import models
const User = require('./User')(sequelize, DataTypes);
const Incentive = require('./Incentive')(sequelize, DataTypes);
const Document = require('./Document')(sequelize, DataTypes);
const Application = require('./Application')(sequelize, DataTypes);
const Ticket = require('./Ticket')(sequelize, DataTypes);
const TicketMessage = require('./TicketMessage')(sequelize, DataTypes);
const Message = require('./Message')(sequelize, DataTypes);
const Chat = require('./Chat')(sequelize, DataTypes);
const Post = require('./Post')(sequelize, DataTypes);
const UploadedDocument = require('./UploadedDocument')(sequelize, DataTypes);
const Regulation = require('./Regulation')(sequelize, DataTypes);
const Sector = require('./Sector')(sequelize, DataTypes);
const IncentiveType = require('./IncentiveType')(sequelize, DataTypes);
const IncentiveRequiredDocuments = require('./IncentiveRequiredDocuments')(sequelize, DataTypes);

// Add models to db object
db.User = User;
db.Incentive = Incentive;
db.Document = Document;
db.Application = Application;
db.Ticket = Ticket;
db.TicketMessage = TicketMessage;
db.Message = Message;
db.Chat = Chat;
db.Post = Post;
db.UploadedDocument = UploadedDocument;
db.Regulation = Regulation;
db.IncentiveRequiredDocuments = IncentiveRequiredDocuments;
db.Sector = Sector;
db.IncentiveType = IncentiveType;

// Define associations
Object.keys(db).forEach(modelName => {
  if (db[modelName].associate && modelName !== 'Message') {
    db[modelName].associate(db);
  }
});

// Application associations
db.Application.hasOne(db.Chat, { foreignKey: 'applicationId', as: 'chat' });

// User associations for chat
db.User.hasMany(db.Chat, { foreignKey: 'userId', as: 'userChats' });
db.User.hasMany(db.Chat, { foreignKey: 'consultantId', as: 'consultantChats' });

// Message associations
db.Message.belongsTo(db.User, { foreignKey: 'senderId', as: 'sender' });

db.sequelize = sequelize;
db.Sequelize = Sequelize;

module.exports = db;