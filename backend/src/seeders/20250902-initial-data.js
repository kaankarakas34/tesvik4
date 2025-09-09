const bcrypt = require('bcryptjs');
const { v4: uuidv4 } = require('uuid');

module.exports = {
  up: async (queryInterface, Sequelize) => {
    // Hash password for admin user
    const hashedPassword = await bcrypt.hash('admin123', 12);
    
    // Create admin user
    await queryInterface.bulkInsert('users', [
      {
        id: uuidv4(),
        email: 'admin@tesvik360.com',
        password: hashedPassword,
        full_name: 'System Administrator',
        company_name: null,
        phone: '+90 555 000 00 00',
        role: 'admin',
        sector_id: null,
        status: 'active',
        refresh_token: null,
        created_at: new Date(),
        updated_at: new Date()
      }
    ]);

    // Create sample documents
    await queryInterface.bulkInsert('documents', [
      {
        id: 1,
        name: 'Vergi Levhası',
        description: 'Şirketin vergi levhası fotokopisi',
        created_at: new Date(),
        updated_at: new Date()
      },
      {
        id: 2,
        name: 'Ticaret Sicil Gazetesi',
        description: 'Şirket ticaret sicil gazetesi',
        created_at: new Date(),
        updated_at: new Date()
      },
      {
        id: 3,
        name: 'İmza Sirküleri',
        description: 'Şirket yetkililerin imza sirküleri',
        created_at: new Date(),
        updated_at: new Date()
      },
      {
        id: 4,
        name: 'Proje Detay Dosyası',
        description: 'Yatırım projesinin detaylı açıklaması',
        created_at: new Date(),
        updated_at: new Date()
      },
      {
        id: 5,
        name: 'Mali Durum Bilgileri',
        description: 'Şirketin mali durumunu gösteren belgeler',
        created_at: new Date(),
        updated_at: new Date()
      }
    ]);

    // Create sample incentives
    await queryInterface.bulkInsert('incentives', [
      {
        id: 1,
        name: 'Yatırım Teşvik Belgesi',
        description: 'Sabit yatırımlar için verilen teşvik belgesi. Vergi indirimi, gümrük muafiyeti ve SSK primi desteği sağlar.',
        is_active: true,
        created_at: new Date(),
        updated_at: new Date()
      },
      {
        id: 2,
        name: 'Ar-Ge Teşvik Belgesi',
        description: 'Araştırma ve geliştirme faaliyetleri için özel teşvik paketi.',
        is_active: true,
        created_at: new Date(),
        updated_at: new Date()
      },
      {
        id: 3,
        name: 'Bölgesel Teşvik Belgesi',
        description: 'Az gelişmiş bölgelerdeki yatırımlar için ek teşvik imkanları.',
        is_active: true,
        created_at: new Date(),
        updated_at: new Date()
      },
      {
        id: 4,
        name: 'İstihdam Teşvik Belgesi',
        description: 'Yeni istihdam oluşturan şirketler için SGK primi desteği.',
        is_active: true,
        created_at: new Date(),
        updated_at: new Date()
      }
    ]);

    // Create incentive-document relationships
    await queryInterface.bulkInsert('IncentiveRequiredDocuments', [
      // Yatırım Teşvik Belgesi için gerekli belgeler
      { incentive_id: 1, document_id: 1, created_at: new Date(), updated_at: new Date() },
      { incentive_id: 1, document_id: 2, created_at: new Date(), updated_at: new Date() },
      { incentive_id: 1, document_id: 3, created_at: new Date(), updated_at: new Date() },
      { incentive_id: 1, document_id: 4, created_at: new Date(), updated_at: new Date() },
      
      // Ar-Ge Teşvik Belgesi için gerekli belgeler
      { incentive_id: 2, document_id: 1, created_at: new Date(), updated_at: new Date() },
      { incentive_id: 2, document_id: 2, created_at: new Date(), updated_at: new Date() },
      { incentive_id: 2, document_id: 4, created_at: new Date(), updated_at: new Date() },
      
      // Bölgesel Teşvik Belgesi için gerekli belgeler
      { incentive_id: 3, document_id: 1, created_at: new Date(), updated_at: new Date() },
      { incentive_id: 3, document_id: 2, created_at: new Date(), updated_at: new Date() },
      { incentive_id: 3, document_id: 3, created_at: new Date(), updated_at: new Date() },
      { incentive_id: 3, document_id: 4, created_at: new Date(), updated_at: new Date() },
      { incentive_id: 3, document_id: 5, created_at: new Date(), updated_at: new Date() },
      
      // İstihdam Teşvik Belgesi için gerekli belgeler
      { incentive_id: 4, document_id: 1, created_at: new Date(), updated_at: new Date() },
      { incentive_id: 4, document_id: 2, created_at: new Date(), updated_at: new Date() },
      { incentive_id: 4, document_id: 3, created_at: new Date(), updated_at: new Date() }
    ]);

    console.log('✅ Sample data created successfully!');
    console.log('📧 Admin email: admin@tesvik360.com');
    console.log('🔑 Admin password: admin123');
  },

  down: async (queryInterface, Sequelize) => {
    // Remove sample data in reverse order
    await queryInterface.bulkDelete('IncentiveRequiredDocuments', null, {});
    await queryInterface.bulkDelete('incentives', null, {});
    await queryInterface.bulkDelete('documents', null, {});
    await queryInterface.bulkDelete('users', { email: 'admin@tesvik360.com' }, {});
  }
};