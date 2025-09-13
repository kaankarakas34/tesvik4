const { User, Sector, sequelize } = require('./src/models');
const { Op } = require('sequelize');
const bcrypt = require('bcryptjs');
const { v4: uuidv4 } = require('uuid');

async function createConsultantCompanies() {
  try {
    await sequelize.authenticate();
    console.log('Veritabanı bağlantısı başarılı.');

    // Mevcut danışman şirketlerini kontrol et
    const existingConsultantCompanies = await User.count({ 
      where: { 
        role: 'consultant',
        companyName: { [Op.not]: null }
      } 
    });
    console.log(`Mevcut danışman şirketi sayısı: ${existingConsultantCompanies}`);

    // Danışman şirket isimleri
    const consultantCompanyNames = [
      'Teşvik Danışmanlık A.Ş.',
      'Proje Yönetim Danışmanlık Ltd.',
      'İnovasyon Destek Danışmanlık A.Ş.',
      'Stratejik Danışmanlık Hizmetleri Ltd.',
      'Teknoloji Transfer Danışmanlık A.Ş.',
      'AR-GE Proje Danışmanlık Ltd.',
      'Sektörel Danışmanlık A.Ş.',
      'Yatırım Teşvik Danışmanlık Ltd.',
      'Kurumsal Gelişim Danışmanlık A.Ş.',
      'Dijital Dönüşüm Danışmanlık Ltd.',
      'Sürdürülebilirlik Danışmanlık A.Ş.',
      'İhracat Geliştirme Danışmanlık Ltd.',
      'Finans Danışmanlık A.Ş.',
      'İnsan Kaynakları Danışmanlık Ltd.',
      'Kalite Yönetim Danışmanlık A.Ş.'
    ];

    const firstNames = ['Ahmet', 'Mehmet', 'Ayşe', 'Fatma', 'Mustafa', 'Emine', 'Ali', 'Hatice', 'Murat', 'Zeynep'];
    const lastNames = ['Yılmaz', 'Kaya', 'Demir', 'Çelik', 'Şahin', 'Öztürk', 'Aydın', 'Özdemir', 'Arslan', 'Doğan'];

    // Danışman şirketleri oluştur
    const consultantCompaniesToCreate = [];
    const hashedPassword = await bcrypt.hash('consultant123', 12);

    for (let i = 1; i <= 10; i++) {
      const firstName = firstNames[Math.floor(Math.random() * firstNames.length)];
      const lastName = lastNames[Math.floor(Math.random() * lastNames.length)];
      const companyName = consultantCompanyNames[i - 1];
      
      consultantCompaniesToCreate.push({
        id: uuidv4(),
        email: `danisman-sirket${i}@tesvik360.com`,
        password: hashedPassword,
        fullName: `${firstName} ${lastName}`,
        companyName: companyName,
        phone: `+90555${String(i + 2000).padStart(7, '0')}`,
        role: 'consultant',
        status: 'active',
        createdAt: new Date(),
        updatedAt: new Date()
      });
    }

    // Danışman şirketlerini oluştur
    const createdConsultantCompanies = await User.bulkCreate(consultantCompaniesToCreate, {
      validate: true,
      individualHooks: false
    });

    console.log(`${createdConsultantCompanies.length} yeni danışman şirketi oluşturuldu.`);
    
    // Oluşturulan danışman şirketlerini listele
    console.log('\nOluşturulan danışman şirketleri:');
    createdConsultantCompanies.forEach((company, index) => {
      console.log(`${index + 1}. ${company.fullName} - ${company.companyName} - ${company.email}`);
    });

    // Şimdi mevcut danışmanları bu şirketlere ata
    console.log('\n--- Mevcut danışmanları şirketlere atama ---');
    
    const existingConsultants = await User.findAll({
      where: {
        role: 'consultant',
        companyId: null // Henüz şirkete atanmamış danışmanlar
      }
    });

    console.log(`Şirkete atanacak danışman sayısı: ${existingConsultants.length}`);

    if (existingConsultants.length > 0) {
      const assignments = [];
      
      // Her danışmanı bir şirkete ata (round-robin)
      for (let i = 0; i < existingConsultants.length; i++) {
        const consultant = existingConsultants[i];
        const companyIndex = i % createdConsultantCompanies.length;
        const assignedCompany = createdConsultantCompanies[companyIndex];
        
        await consultant.update({ 
          companyId: assignedCompany.id 
        });
        
        assignments.push({
          consultantName: consultant.fullName,
          consultantEmail: consultant.email,
          companyName: assignedCompany.companyName,
          companyEmail: assignedCompany.email
        });
      }

      console.log('\nDanışman atamaları:');
      assignments.forEach((assignment, index) => {
        console.log(`${index + 1}. ${assignment.consultantName} (${assignment.consultantEmail}) -> ${assignment.companyName}`);
      });
    }

  } catch (error) {
    console.error('Hata:', error);
  } finally {
    await sequelize.close();
  }
}

createConsultantCompanies();