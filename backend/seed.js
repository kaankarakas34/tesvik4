const bcrypt = require('bcryptjs');
const { v4: uuidv4 } = require('uuid');
const { User, Incentive, Document } = require('./src/models');

async function seedDatabase() {
  try {
    console.log('🌱 Starting database seeding...');

    // Check if admin already exists
    const existingAdmin = await User.findOne({ 
      where: { email: 'admin@tesvik360.com' } 
    });

    if (!existingAdmin) {
      // Create admin user
      const hashedPassword = await bcrypt.hash('admin123', 12);
      
      const admin = await User.create({
        id: uuidv4(),
        email: 'admin@tesvik360.com',
        password: hashedPassword,
        fullName: 'System Administrator',
        role: 'admin',
        status: 'active'
      });

      console.log('✅ Admin user created');
      console.log(`📧 Email: admin@tesvik360.com`);
      console.log(`🔑 Password: admin123`);
    } else {
      console.log('ℹ️ Admin user already exists');
    }

    // Create sample documents
    const documents = [
      { name: 'Vergi Levhası', description: 'Şirketin vergi levhası fotokopisi' },
      { name: 'Ticaret Sicil Gazetesi', description: 'Şirket ticaret sicil gazetesi' },
      { name: 'İmza Sirküleri', description: 'Şirket yetkililerin imza sirküleri' },
      { name: 'Proje Detay Dosyası', description: 'Yatırım projesinin detaylı açıklaması' },
      { name: 'Mali Durum Bilgileri', description: 'Şirketin mali durumunu gösteren belgeler' }
    ];

    for (const doc of documents) {
      await Document.findOrCreate({
        where: { name: doc.name },
        defaults: doc
      });
    }

    // Create sample incentives
    const incentives = [
      {
        name: 'Yatırım Teşvik Belgesi',
        description: 'Sabit yatırımlar için verilen teşvik belgesi. Vergi indirimi, gümrük muafiyeti ve SSK primi desteği sağlar.',
        isActive: true
      },
      {
        name: 'Ar-Ge Teşvik Belgesi',
        description: 'Araştırma ve geliştirme faaliyetleri için özel teşvik paketi.',
        isActive: true
      },
      {
        name: 'Bölgesel Teşvik Belgesi',
        description: 'Az gelişmiş bölgelerdeki yatırımlar için ek teşvik imkanları.',
        isActive: true
      },
      {
        name: 'İstihdam Teşvik Belgesi',
        description: 'Yeni istihdam oluşturan şirketler için SGK primi desteği.',
        isActive: true
      }
    ];

    for (const incentive of incentives) {
      await Incentive.findOrCreate({
        where: { name: incentive.name },
        defaults: incentive
      });
    }

    console.log('✅ Sample documents and incentives created');
    console.log('🎉 Database seeding completed successfully!');

  } catch (error) {
    console.error('❌ Seeding error:', error);
  }
}

// Run if called directly
if (require.main === module) {
  seedDatabase().then(() => {
    process.exit(0);
  }).catch((error) => {
    console.error(error);
    process.exit(1);
  });
}

module.exports = seedDatabase;