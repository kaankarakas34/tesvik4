const bcrypt = require('bcryptjs');
const { v4: uuidv4 } = require('uuid');
const { User, Application, Incentive, Document } = require('./src/models');

async function seedApplications() {
  try {
    console.log('🌱 Starting application seeding...');

    // Create sample users (companies)
    const users = [
      {
        email: 'info@teknoloji.com',
        password: await bcrypt.hash('user123', 12),
        fullName: 'Teknoloji A.Ş.',
        role: 'user',
        status: 'active',
        phone: '+90 212 555 0101',
        address: 'Maslak Mahallesi, Teknoloji Caddesi No:1, Sarıyer/İstanbul'
      },
      {
        email: 'contact@imalat.com',
        password: await bcrypt.hash('user123', 12),
        fullName: 'İmalat Sanayi Ltd. Şti.',
        role: 'user',
        status: 'active',
        phone: '+90 232 555 0202',
        address: 'Organize Sanayi Bölgesi, 1. Cadde No:15, Çiğli/İzmir'
      },
      {
        email: 'info@yazilim.com',
        password: await bcrypt.hash('user123', 12),
        fullName: 'Yazılım Geliştirme A.Ş.',
        role: 'user',
        status: 'active',
        phone: '+90 312 555 0303',
        address: 'Bilkent Plaza, Teknoloji Geliştirme Bölgesi, Çankaya/Ankara'
      },
      {
        email: 'info@gida.com',
        password: await bcrypt.hash('user123', 12),
        fullName: 'Gıda Üretim San. Tic. A.Ş.',
        role: 'user',
        status: 'active',
        phone: '+90 224 555 0404',
        address: 'Sanayi Mahallesi, Üretim Caddesi No:25, Nilüfer/Bursa'
      }
    ];

    const createdUsers = [];
    for (const userData of users) {
      const [user] = await User.findOrCreate({
        where: { email: userData.email },
        defaults: { ...userData, id: uuidv4() }
      });
      createdUsers.push(user);
    }

    // Get incentives
    const incentives = await Incentive.findAll();
    
    // Create sample applications (based on actual Application model structure)
    const applications = [
      {
        companyId: createdUsers[0].id,
        status: 'pending_assignment'
      },
      {
        companyId: createdUsers[1].id,
        status: 'completed'
      },
      {
        companyId: createdUsers[2].id,
        status: 'in_progress'
      },
      {
        companyId: createdUsers[3].id,
        status: 'rejected'
      },
      {
        companyId: createdUsers[0].id,
        status: 'document_review'
      }
    ];

    for (const appData of applications) {
      await Application.findOrCreate({
        where: { 
          companyId: appData.companyId,
          status: appData.status
        },
        defaults: { ...appData, id: uuidv4() }
      });
    }

    console.log('✅ Sample users created:');
    console.log('📧 info@teknoloji.com - Password: user123');
    console.log('📧 contact@imalat.com - Password: user123');
    console.log('📧 info@yazilim.com - Password: user123');
    console.log('📧 info@gida.com - Password: user123');
    console.log('✅ Sample applications created');
    console.log('🎉 Application seeding completed successfully!');

  } catch (error) {
    console.error('❌ Application seeding error:', error);
  }
}

// Run if called directly
if (require.main === module) {
  seedApplications().then(() => {
    process.exit(0);
  }).catch((error) => {
    console.error(error);
    process.exit(1);
  });
}

module.exports = seedApplications;