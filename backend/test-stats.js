require('dotenv').config();
const { Sequelize } = require('sequelize');
const db = require('./src/models');

async function testStats() {
  try {
    console.log('Testing application stats query...');
    
    // Test the exact query from getApplicationStats
    const totalApplications = await db.Application.count();
    console.log('Total applications:', totalApplications);
    
    const pendingApplications = await db.Application.count({
      where: { status: 'pending_assignment' }
    });
    console.log('Pending applications:', pendingApplications);
    
    const inProgressApplications = await db.Application.count({
      where: { status: 'in_progress' }
    });
    console.log('In progress applications:', inProgressApplications);
    
    const completedApplications = await db.Application.count({
      where: { status: 'completed' }
    });
    console.log('Completed applications:', completedApplications);
    
    const totalIncentives = await db.Incentive.count();
    console.log('Total incentives:', totalIncentives);
    
    const activeIncentives = await db.Incentive.count({
      where: { isActive: true }
    });
    console.log('Active incentives:', activeIncentives);
    
    console.log('All queries completed successfully!');
    
  } catch (error) {
    console.error('Error in stats query:', error.message);
    console.error('Stack trace:', error.stack);
  } finally {
    await db.sequelize.close();
  }
}

testStats();