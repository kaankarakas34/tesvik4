const { User, Sector, sequelize } = require('./src/models');

async function assignSectorsToMembers() {
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

    // Sektörsüz şirket üyelerini al
    const members = await User.findAll({
      where: { 
        role: 'company',
        sectorId: null 
      },
      attributes: ['id', 'fullName', 'email', 'companyName'],
      order: [['id', 'ASC']]
    });

    console.log(`Sektörsüz şirket üyesi sayısı: ${members.length}`);

    if (members.length === 0) {
      console.log('✅ Tüm şirket üyeleri zaten bir sektöre atanmış.');
      return;
    }

    const assignments = [];
    let sectorIndex = 0;

    // Her üyeye sırayla sektör ata (round-robin)
    for (let i = 0; i < members.length; i++) {
      const member = members[i];
      const sector = sectors[sectorIndex % sectors.length];
      
      // Üyenin sektörünü güncelle
      await member.update({ sectorId: sector.id });
      
      assignments.push({
        memberId: member.id,
        memberName: member.fullName,
        memberEmail: member.email,
        companyName: member.companyName,
        sectorId: sector.id,
        sectorName: sector.name
      });
      
      console.log(`✅ ${member.fullName} (${member.companyName}) → ${sector.name}`);
      
      sectorIndex++;
    }

    // Özet rapor
    console.log('\n' + '='.repeat(60));
    console.log('📊 SEKTÖR ATAMA ÖZETİ');
    console.log('='.repeat(60));
    console.log(`Toplam atama sayısı: ${assignments.length}`);
    console.log(`Atanan üye sayısı: ${members.length}`);

    // Sektör bazında üye dağılımı
    console.log('\n📈 SEKTÖR BAZINDA ÜYE DAĞILIMI:');
    const sectorCounts = {};
    
    assignments.forEach(assignment => {
      if (!sectorCounts[assignment.sectorName]) {
        sectorCounts[assignment.sectorName] = 0;
      }
      sectorCounts[assignment.sectorName]++;
    });

    Object.entries(sectorCounts)
      .sort(([,a], [,b]) => b - a)
      .forEach(([sectorName, count]) => {
        console.log(`• ${sectorName}: ${count} üye`);
      });

    // İlk 10 atamayı detaylı göster
    console.log('\n📋 İLK 10 ATAMA DETAYı:');
    assignments.slice(0, 10).forEach((assignment, index) => {
      console.log(`${index + 1}. ${assignment.memberName} (${assignment.companyName}) → ${assignment.sectorName}`);
    });

    if (assignments.length > 10) {
      console.log(`... ve ${assignments.length - 10} atama daha`);
    }

    console.log('\n✅ Sektör atamaları tamamlandı!');

  } catch (error) {
    console.error('Hata:', error);
  } finally {
    await sequelize.close();
  }
}

assignSectorsToMembers();