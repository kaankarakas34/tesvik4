require('dotenv').config();
const { Sequelize } = require('sequelize');

const sequelize = new Sequelize(process.env.DATABASE_URL);

async function checkJunctionTable() {
  try {
    // Check if ApplicationIncentives table exists
    const [results] = await sequelize.query(`
      SELECT column_name, data_type 
      FROM information_schema.columns 
      WHERE table_name = 'ApplicationIncentives' 
      ORDER BY ordinal_position;
    `);
    
    if (results.length === 0) {
      console.log('ApplicationIncentives table does not exist');
      return;
    }
    
    console.log('ApplicationIncentives table columns:');
    results.forEach(col => {
      console.log(`${col.column_name}: ${col.data_type}`);
    });
    
    // Check if there's any data
    const [countResult] = await sequelize.query('SELECT COUNT(*) as count FROM "ApplicationIncentives"');
    console.log(`\nTotal records: ${countResult[0].count}`);
    
  } catch (error) {
    console.error('Error:', error.message);
  } finally {
    await sequelize.close();
  }
}

checkJunctionTable();