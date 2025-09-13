const { User, Sector, sequelize } = require('./src/models');

async function assignConsultantsToSectors() {
  try {
    await sequelize.authenticate();
    console.log('Veritabanı bağlantısı başarılı.');

    // Aktif sektörleri al
    const sectors = await Sector.findAll({ 
      where: { isActive: true },
      attributes: ['id', 'name'],
      order: [['id', 'ASC']]
    });
    
    console.log(`Toplam aktif sektör sayısı: ${sectors.length}`);

    // Sektörsüz danışmanları al
    const consultants = await User.findAll({
      where: { 
        role: 'consultant',
        sectorId: null 
      },
      attributes: ['id', 'fullName', 'email'],
      order: [['id', 'ASC']]
    });

    console.log(`Sektörsüz danışman sayısı: ${consultants.length}`);

    if (consultants.length < sectors.length * 3) {
      console.log('⚠️ Uyarı: Tüm sektörlere 3 danışman atamak için yeterli danışman yok!');
      console.log(`Gerekli: ${sectors.length * 3}, Mevcut: ${consultants.length}`);
    }

    let consultantIndex = 0;
    const assignments = [];

    // Her sektör için 3 danışman ata
    for (const sector of sectors) {
      console.log(`\n📋 ${sector.name} sektörüne danışman atanıyor...`);
      
      const sectorConsultants = [];
      
      for (let i = 0; i < 3; i++) {
        if (consultantIndex < consultants.length) {
          const consultant = consultants[consultantIndex];
          
          // Danışmanın sektörünü güncelle
          await consultant.update({ sectorId: sector.id });
          
          sectorConsultants.push(consultant);
          assignments.push({
            sectorId: sector.id,
            sectorName: sector.name,
            consultantId: consultant.id,
            consultantName: consultant.fullName,
            consultantEmail: consultant.email
          });
          
          consultantIndex++;
        } else {
          console.log(`⚠️ Sektör ${sector.name} için yeterli danışman kalmadı!`);
          break;
        }
      }
      
      console.log(`✅ ${sector.name} sektörüne ${sectorConsultants.length} danışman atandı:`);
      sectorConsultants.forEach((consultant, index) => {
        console.log(`   ${index + 1}. ${consultant.fullName} (${consultant.email})`);
      });
    }

    // Özet rapor
    console.log('\n' + '='.repeat(60));
    console.log('📊 ATAMA ÖZETİ');
    console.log('='.repeat(60));
    console.log(`Toplam atama sayısı: ${assignments.length}`);
    console.log(`Atanan danışman sayısı: ${consultantIndex}`);
    console.log(`Kalan sektörsüz danışman: ${consultants.length - consultantIndex}`);

    // Sektör bazında özet
    console.log('\n📈 SEKTÖR BAZINDA DANIŞMAN SAYILARI:');
    for (const sector of sectors) {
      const sectorAssignments = assignments.filter(a => a.sectorId === sector.id);
      console.log(`• ${sector.name}: ${sectorAssignments.length} danışman`);
    }

    console.log('\n✅ Danışman atamaları tamamlandı!');

  } catch (error) {
    console.error('Hata:', error);
  } finally {
    await sequelize.close();
  }
}

assignConsultantsToSectors();