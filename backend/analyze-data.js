const { User, Sector, Incentive, sequelize } = require('./src/models');

async function analyzeData() {
  try {
    await sequelize.authenticate();
    console.log('Veritabanı bağlantısı başarılı.');

    // Sektör sayısını kontrol et
    const sectorCount = await Sector.count({ where: { isActive: true } });
    console.log(`\nAktif Sektör Sayısı: ${sectorCount}`);

    // Danışman sayısını kontrol et
    const consultantCount = await User.count({ where: { role: 'consultant' } });
    console.log(`Danışman Sayısı: ${consultantCount}`);

    // Şirket üyesi sayısını kontrol et
    const companyCount = await User.count({ where: { role: 'company' } });
    console.log(`Şirket Üyesi Sayısı: ${companyCount}`);

    // Teşvik sayısını kontrol et
    const incentiveCount = await Incentive.count({ where: { isActive: true } });
    console.log(`Aktif Teşvik Sayısı: ${incentiveCount}`);

    // Sektörleri listele
    const sectors = await Sector.findAll({ 
      where: { isActive: true },
      attributes: ['id', 'name']
    });
    console.log('\nAktif Sektörler:');
    sectors.forEach(sector => {
      console.log(`- ${sector.id}: ${sector.name}`);
    });

    // Her sektör için gerekli danışman sayısını hesapla
    const requiredConsultants = sectorCount * 3;
    console.log(`\nGerekli Danışman Sayısı: ${requiredConsultants}`);
    console.log(`Eksik Danışman: ${Math.max(0, requiredConsultants - consultantCount)}`);

    // Sektörsüz üyeleri kontrol et
    const usersWithoutSector = await User.count({ 
      where: { 
        role: 'company',
        sectorId: null 
      } 
    });
    console.log(`\nSektörsüz Şirket Üyesi: ${usersWithoutSector}`);

    // Her sektör için teşvik sayısını kontrol et
    console.log('\nSektör başına teşvik dağılımı:');
    for (const sector of sectors) {
      const incentiveCountForSector = await Incentive.count({
        where: { 
          sectorId: sector.id,
          isActive: true 
        }
      });
      console.log(`- ${sector.name}: ${incentiveCountForSector} teşvik`);
    }

  } catch (error) {
    console.error('Hata:', error);
  } finally {
    await sequelize.close();
  }
}

analyzeData();