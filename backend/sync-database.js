const { sequelize } = require('./src/models');

async function syncDatabase() {
  try {
    console.log('🔄 Syncing database models...');
    
    // Force sync all models (this will drop and recreate tables)
    await sequelize.sync({ force: true });
    
    console.log('✅ Database models synced successfully!');
    console.log('⚠️ All existing data has been cleared. You may need to run seed scripts again.');
    
  } catch (error) {
    console.error('❌ Database sync error:', error);
  } finally {
    await sequelize.close();
  }
}

// Run if called directly
if (require.main === module) {
  syncDatabase().then(() => {
    process.exit(0);
  }).catch((error) => {
    console.error(error);
    process.exit(1);
  });
}

module.exports = syncDatabase;