const { User, Sector, sequelize } = require('./src/models');
const bcrypt = require('bcryptjs');

async function createConsultants() {
  try {
    await sequelize.authenticate();
    console.log('Veritabanı bağlantısı başarılı.');

    // Mevcut danışman sayısını kontrol et
    const currentConsultants = await User.count({ where: { role: 'consultant' } });
    console.log(`Mevcut danışman sayısı: ${currentConsultants}`);

    // Aktif sektörleri al
    const sectors = await Sector.findAll({ 
      where: { isActive: true },
      attributes: ['id', 'name']
    });
    
    const requiredConsultants = sectors.length * 3; // Her sektör için 3 danışman
    const missingConsultants = requiredConsultants - currentConsultants;
    
    console.log(`Gerekli danışman sayısı: ${requiredConsultants}`);
    console.log(`Eksik danışman sayısı: ${missingConsultants}`);

    if (missingConsultants <= 0) {
      console.log('Yeterli danışman mevcut.');
      return;
    }

    // Eksik danışmanları oluştur
    const consultantsToCreate = [];
    const hashedPassword = await bcrypt.hash('123456', 10); // Varsayılan şifre

    for (let i = 1; i <= missingConsultants; i++) {
      const consultantNumber = currentConsultants + i;
      consultantsToCreate.push({
        email: `danisman${consultantNumber}@tesvik360.com`,
        password: hashedPassword,
        fullName: `Danışman ${consultantNumber}`,
        companyName: `Danışmanlık Firması ${consultantNumber}`,
        phone: `+90555${String(consultantNumber).padStart(7, '0')}`,
        role: 'consultant',
        status: 'active',
        createdAt: new Date(),
        updatedAt: new Date()
      });
    }

    // Toplu oluşturma
    const createdConsultants = await User.bulkCreate(consultantsToCreate, {
      validate: true,
      individualHooks: false
    });

    console.log(`${createdConsultants.length} yeni danışman oluşturuldu.`);
    
    // Oluşturulan danışmanları listele
    console.log('\nOluşturulan danışmanlar:');
    createdConsultants.forEach((consultant, index) => {
      console.log(`${index + 1}. ${consultant.fullName} - ${consultant.email}`);
    });

  } catch (error) {
    console.error('Hata:', error);
  } finally {
    await sequelize.close();
  }
}

createConsultants();