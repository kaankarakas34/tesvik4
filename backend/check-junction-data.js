require('dotenv').config();
const { Sequelize } = require('sequelize');

const sequelize = new Sequelize(process.env.DATABASE_URL);

async function checkJunctionData() {
  try {
    // Check table structure
    const [columns] = await sequelize.query(`
      SELECT column_name, data_type 
      FROM information_schema.columns 
      WHERE table_name = 'ApplicationIncentives' 
      ORDER BY ordinal_position;
    `);
    
    console.log('ApplicationIncentives table columns:');
    columns.forEach(col => {
      console.log(`${col.column_name}: ${col.data_type}`);
    });
    
    // Check sample data
    const [data] = await sequelize.query('SELECT * FROM "ApplicationIncentives" LIMIT 1');
    console.log('\nSample record:');
    console.log(JSON.stringify(data[0], null, 2));
    
  } catch (error) {
    console.error('Error:', error.message);
  } finally {
    await sequelize.close();
  }
}

checkJunctionData();