const { Sequelize, DataTypes } = require('sequelize');
const path = require('path');

const env = process.env.NODE_ENV || 'development';
const config = require(path.join(__dirname, '..', 'config', 'database.json'))[env];

let sequelize;
if (env === 'development') {
  // Use SQLite for development
  sequelize = new Sequelize({
    dialect: 'sqlite',
    storage: path.join(__dirname, '..', '..', 'database.sqlite'),
    logging: config.logging || false
  });
} else if (process.env.DATABASE_URL) {
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
const Message = require('./Message')(sequelize, DataTypes);
const Post = require('./Post')(sequelize, DataTypes);
const UploadedDocument = require('./UploadedDocument')(sequelize, DataTypes);

// Add models to db object
db.User = User;
db.Incentive = Incentive;
db.Document = Document;
db.Application = Application;
db.Ticket = Ticket;
db.Message = Message;
db.Post = Post;
db.UploadedDocument = UploadedDocument;

// Define associations
Object.keys(db).forEach(modelName => {
  if (db[modelName].associate) {
    db[modelName].associate(db);
  }
});

db.sequelize = sequelize;
db.Sequelize = Sequelize;

module.exports = db;