const { User, Sector } = require('./src/models');

async function assignSectorsToAllUsers() {
  try {
    console.log('Kullanıcılara sektör ataması başlatılıyor...');
    
    // Tüm aktif sektörleri getir
    const sectors = await Sector.findAll({
      where: { isActive: true },
      order: [['id', 'ASC']]
    });
    
    if (sectors.length === 0) {
      console.log('Hiç aktif sektör bulunamadı!');
      return;
    }
    
    console.log(`${sectors.length} aktif sektör bulundu:`);
    sectors.forEach(sector => {
      console.log(`- ${sector.id}: ${sector.name}`);
    });
    
    // Sektörü olmayan tüm kullanıcıları getir
    const usersWithoutSector = await User.findAll({
      where: {
        sectorId: null
      },
      attributes: ['id', 'fullName', 'email', 'role', 'sectorId']
    });
    
    console.log(`\nSektörü olmayan ${usersWithoutSector.length} kullanıcı bulundu.`);
    
    if (usersWithoutSector.length === 0) {
      console.log('Tüm kullanıcıların zaten sektörü var!');
      return;
    }
    
    // Her kullanıcıya rastgele sektör ata
    let assignedCount = 0;
    
    for (const user of usersWithoutSector) {
      // Rastgele sektör seç
      const randomSector = sectors[Math.floor(Math.random() * sectors.length)];
      
      await User.update(
        { sectorId: randomSector.id },
        { where: { id: user.id } }
      );
      
      console.log(`✓ ${user.fullName} (${user.role}) -> ${randomSector.name}`);
      assignedCount++;
    }
    
    console.log(`\n✅ Toplam ${assignedCount} kullanıcıya sektör ataması yapıldı.`);
    
    // Sonuçları kontrol et
    const allUsers = await User.findAll({
      include: [{
        model: Sector,
        as: 'sector',
        attributes: ['id', 'name']
      }],
      attributes: ['id', 'fullName', 'email', 'role', 'sectorId']
    });
    
    console.log('\n📊 Güncel durum:');
    const sectorStats = {};
    
    allUsers.forEach(user => {
      const sectorName = user.sector ? user.sector.name : 'Sektörsüz';
      if (!sectorStats[sectorName]) {
        sectorStats[sectorName] = { total: 0, companies: 0, consultants: 0, admins: 0 };
      }
      sectorStats[sectorName].total++;
      sectorStats[sectorName][user.role + 's']++;
    });
    
    Object.entries(sectorStats).forEach(([sectorName, stats]) => {
      console.log(`${sectorName}: ${stats.total} kullanıcı (${stats.companies} şirket, ${stats.consultants} danışman, ${stats.admins} admin)`);
    });
    
  } catch (error) {
    console.error('Hata:', error);
  }
}

// Script'i çalıştır
if (require.main === module) {
  assignSectorsToAllUsers()
    .then(() => {
      console.log('\n✅ İşlem tamamlandı!');
      process.exit(0);
    })
    .catch(error => {
      console.error('❌ Hata:', error);
      process.exit(1);
    });
}

module.exports = assignSectorsToAllUsers;