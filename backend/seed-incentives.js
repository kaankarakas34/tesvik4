const { Sequelize } = require('sequelize');
const { User, Incentive, Application } = require('./src/models');

// Gerçek teşvik verileri
const incentivesData = [
  {
    name: 'TÜBİTAK 1501 - Sanayi Ar-Ge Projeleri Destekleme Programı',
    description: 'Sanayi kuruluşlarının Ar-Ge kapasitelerini artırmak ve teknolojik yenilik yapmalarını desteklemek amacıyla verilen hibe desteği.',
    amount: 2500000.00,
    type: 'grant',
    isActive: true
  },
  {
    name: 'KOSGEB Ar-Ge İnovasyon ve Endüstriyel Uygulama Desteği',
    description: 'KOBİ\'lerin Ar-Ge ve inovasyon faaliyetlerini destekleyen program. Proje bazlı geri ödemesiz destek sağlanır.',
    amount: 1800000.00,
    type: 'grant',
    isActive: true
  },
  {
    name: 'Sanayi ve Teknoloji Bakanlığı Teknoloji Geliştirme Bölgeleri Desteği',
    description: 'Teknoloji geliştirme bölgelerinde faaliyet gösteren şirketlere sağlanan vergi muafiyeti ve teşvikler.',
    amount: 5000000.00,
    type: 'tax_exemption',
    isActive: true
  },
  {
    name: 'Horizon Europe - Cluster 4: Digital, Industry and Space',
    description: 'AB\'nin Horizon Europe programı kapsamında dijital teknolojiler, endüstri ve uzay alanlarında destekler.',
    amount: 3200000.00,
    type: 'grant',
    isActive: true
  },
  {
    name: 'İstanbul Kalkınma Ajansı Mali Destek Programı',
    description: 'İstanbul bölgesindeki işletmelerin rekabet gücünü artırmaya yönelik proje destekleri.',
    amount: 750000.00,
    type: 'grant',
    isActive: true
  },
  {
    name: 'Yatırım Teşvik Sistemi - Genel Teşvik',
    description: 'Belirli sektörlerde yapılacak yatırımlara sağlanan gümrük vergisi muafiyeti, KDV istisnası ve vergi indirimi.',
    amount: 4500000.00,
    type: 'investment_incentive',
    isActive: true
  },
  {
    name: 'TÜBİTAK 1505 - Üniversite-Sanayi İşbirliği Destek Programı',
    description: 'Üniversite ve sanayi kuruluşları arasındaki işbirliğini geliştirmeye yönelik Ar-Ge projeleri desteği.',
    amount: 1200000.00,
    type: 'grant',
    isActive: true
  },
  {
    name: 'Dijital Türkiye Platformu - Dijital Dönüşüm Desteği',
    description: 'İşletmelerin dijital dönüşüm süreçlerini hızlandırmak için sağlanan teknoloji ve danışmanlık desteği.',
    amount: 850000.00,
    type: 'grant',
    isActive: false // Bu teşvik şu anda pasif
  }
];

// Başvuru durumları
const applicationStatuses = [
  'pending_assignment', // Atama bekliyor
  'in_progress',       // Devam ediyor
  'document_review',   // Belge incelemesi
  'completed',         // Tamamlanmış
  'submitted',         // Sunulmuş
  'rejected'           // Reddedilmiş
];

async function seedIncentivesAndApplications() {
  try {
    console.log('🌱 Teşvikler ve başvurular oluşturuluyor...');

    // Aktif kullanıcıları al
    const users = await User.findAll({
      where: { status: 'active' },
      order: [['createdAt', 'ASC']]
    });

    const companies = users.filter(user => user.role === 'company');
    const consultants = users.filter(user => user.role === 'consultant');
    const admin = users.find(user => user.role === 'admin');

    if (companies.length === 0 || consultants.length === 0) {
      throw new Error('Yeterli şirket veya danışman kullanıcısı bulunamadı!');
    }

    // Teşvikleri oluştur
    console.log('📋 Teşvikler oluşturuluyor...');
    const createdIncentives = [];
    for (const incentiveData of incentivesData) {
      const incentive = await Incentive.create(incentiveData);
      createdIncentives.push(incentive);
      console.log(`✅ Teşvik oluşturuldu: ${incentive.name}`);
    }

    // Başvurular oluştur
    console.log('\n📝 Başvurular oluşturuluyor...');
    const applications = [];

    // Her şirket için 2-3 başvuru oluştur
    for (let i = 0; i < companies.length; i++) {
      const company = companies[i];
      const applicationCount = Math.floor(Math.random() * 2) + 2; // 2-3 başvuru

      for (let j = 0; j < applicationCount; j++) {
        const randomIncentive = createdIncentives[Math.floor(Math.random() * createdIncentives.length)];
        const randomStatus = applicationStatuses[Math.floor(Math.random() * applicationStatuses.length)];
        
        // Danışman ataması (sadece pending_assignment değilse)
        let assignedConsultant = null;
        if (randomStatus !== 'pending_assignment') {
          assignedConsultant = consultants[Math.floor(Math.random() * consultants.length)];
        }

        const application = await Application.create({
          companyId: company.id,
          consultantId: assignedConsultant ? assignedConsultant.id : null,
          status: randomStatus,
          projectTitle: `${company.fullName} - ${randomIncentive.name} Projesi`,
          projectDescription: `${company.fullName} şirketi tarafından ${randomIncentive.name} kapsamında sunulan proje başvurusu.`,
          requestedAmount: Math.floor(randomIncentive.amount * (0.3 + Math.random() * 0.4)), // %30-70 arası
          submissionDate: new Date(Date.now() - Math.random() * 90 * 24 * 60 * 60 * 1000), // Son 90 gün içinde
          expectedStartDate: new Date(Date.now() + Math.random() * 60 * 24 * 60 * 60 * 1000), // Gelecek 60 gün içinde
          expectedEndDate: new Date(Date.now() + (365 + Math.random() * 365) * 24 * 60 * 60 * 1000), // 1-2 yıl arası
          notes: randomStatus === 'pending_assignment' ? 'Danışman ataması bekleniyor.' : `Durum: ${randomStatus}`
        });

        // Teşvik ile başvuru arasında ilişki kur
        await application.addIncentive(randomIncentive);
        
        applications.push(application);
        
        const statusText = randomStatus === 'pending_assignment' ? '⏳ ATAMA BEKLİYOR' : 
                          randomStatus === 'in_progress' ? '🔄 DEVAM EDİYOR' :
                          randomStatus === 'document_review' ? '📄 BELGE İNCELEMESİ' :
                          randomStatus === 'completed' ? '✅ TAMAMLANMIŞ' :
                          randomStatus === 'submitted' ? '📤 SUNULMUŞ' : '❌ REDDEDİLMİŞ';
        
        console.log(`📋 Başvuru oluşturuldu: ${company.fullName} -> ${randomIncentive.name.substring(0, 50)}... [${statusText}]`);
      }
    }

    // Özel olarak 1 tane "atama bekliyor" durumunda başvuru oluştur
    const specialCompany = companies[0];
    const specialIncentive = createdIncentives[0];
    
    const pendingApplication = await Application.create({
      companyId: specialCompany.id,
      consultantId: null, // Danışman atanmamış
      status: 'pending_assignment',
      projectTitle: `${specialCompany.fullName} - Özel Atama Bekleyen Proje`,
      projectDescription: 'Bu proje özellikle danışman ataması bekleyen durumda oluşturulmuştur.',
      requestedAmount: Math.floor(specialIncentive.amount * 0.5),
      submissionDate: new Date(),
      expectedStartDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
      expectedEndDate: new Date(Date.now() + 18 * 30 * 24 * 60 * 60 * 1000),
      notes: 'Acil danışman ataması gerekiyor - Özel proje'
    });

    await pendingApplication.addIncentive(specialIncentive);
    applications.push(pendingApplication);

    console.log('\n📊 ÖZET:');
    console.log(`✅ ${createdIncentives.length} teşvik oluşturuldu`);
    console.log(`✅ ${applications.length} başvuru oluşturuldu`);
    console.log(`⏳ ${applications.filter(app => app.status === 'pending_assignment').length} başvuru atama bekliyor`);
    console.log(`🔄 ${applications.filter(app => app.status === 'in_progress').length} başvuru devam ediyor`);
    console.log(`📄 ${applications.filter(app => app.status === 'document_review').length} başvuru belge incelemesinde`);
    console.log(`✅ ${applications.filter(app => app.status === 'completed').length} başvuru tamamlanmış`);
    console.log(`📤 ${applications.filter(app => app.status === 'submitted').length} başvuru sunulmuş`);
    console.log(`❌ ${applications.filter(app => app.status === 'rejected').length} başvuru reddedilmiş`);

    console.log('\n🎉 Teşvikler ve başvurular başarıyla oluşturuldu!');
    
  } catch (error) {
    console.error('❌ Hata:', error.message);
    console.error(error);
  }
}

// Script çalıştırılırsa
if (require.main === module) {
  seedIncentivesAndApplications()
    .then(() => {
      console.log('✅ İşlem tamamlandı!');
      process.exit(0);
    })
    .catch((error) => {
      console.error('❌ İşlem başarısız:', error);
      process.exit(1);
    });
}

module.exports = { seedIncentivesAndApplications };