const { User } = require('./src/models');

async function deleteTestUsers() {
  try {
    console.log('🗑️ Deleting test users from Teşvik360...');

    // Test user emails to delete
    const testEmails = [
      'admin@tesvik360.com',
      'demo@akintechnology.com',
      'info@innovasyon.com',
      'contact@digitech.com',
      'admin@greentech.com',
      'ahmet@danismanlik.com',
      'fatma@tesvikuzman.com',
      'elif@uzman.com',
      'mustafa@consultant.com'
    ];

    // Delete test users
    const deletedCount = await User.destroy({
      where: {
        email: testEmails
      }
    });

    console.log(`✅ ${deletedCount} test users deleted successfully!`);
    
    // Show remaining users
    const remainingUsers = await User.findAll({
      attributes: ['id', 'fullName', 'email', 'role', 'status'],
      order: [['createdAt', 'DESC']]
    });

    console.log('\n📋 Remaining users in database:');
    if (remainingUsers.length === 0) {
      console.log('No users found in database.');
    } else {
      remainingUsers.forEach(user => {
        console.log(`- ${user.fullName} (${user.email}) - ${user.role} - ${user.status}`);
      });
    }

    process.exit(0);
  } catch (error) {
    console.error('❌ Error deleting test users:', error);
    process.exit(1);
  }
}

// Run the function
deleteTestUsers();