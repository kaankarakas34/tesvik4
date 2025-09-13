const { Incentive, Sector, sequelize } = require('./src/models');

async function createIncentivesForSectors() {
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

    // Mevcut teşvik sayısını kontrol et
    const existingIncentives = await Incentive.count();
    console.log(`Mevcut teşvik sayısı: ${existingIncentives}`);

    const incentiveTemplates = [
      {
        title: 'Ar-Ge Teşviki',
        description: 'Araştırma ve geliştirme faaliyetleri için sağlanan destek programı',
        amount: 500000,
        type: 'grant',
        requirements: 'Ar-Ge projesi sunumu, personel istihdamı, teknoloji transferi'
      },
      {
        title: 'İstihdam Teşviki',
        description: 'Yeni personel istihdamı için sağlanan prim ve vergi avantajları',
        amount: 250000,
        type: 'tax_incentive',
        requirements: 'En az 10 kişi istihdam, 2 yıl çalışma garantisi'
      },
      {
        title: 'İhracat Teşviki',
        description: 'İhracat faaliyetlerini destekleyen finansal yardım programı',
        amount: 750000,
        type: 'subsidy',
        requirements: 'İhracat hedefi belirleme, kalite sertifikası, pazar araştırması'
      },
      {
        title: 'Yatırım Teşviki',
        description: 'Sabit yatırımlar için sağlanan vergi indirimi ve destek',
        amount: 1000000,
        type: 'tax_incentive',
        requirements: 'Minimum yatırım tutarı, istihdam taahhüdü, çevre uygunluğu'
      }
    ];

    const createdIncentives = [];
    let totalCreated = 0;

    // Her sektör için 4 teşvik oluştur
    for (const sector of sectors) {
      console.log(`\n📋 ${sector.name} sektörü için teşvikler oluşturuluyor...`);
      
      const sectorIncentives = [];
      
      for (let i = 0; i < incentiveTemplates.length; i++) {
        const template = incentiveTemplates[i];
        
        const incentive = await Incentive.create({
          name: `${template.title} - ${sector.name}`,
          description: `${template.description} (${sector.name} sektörü için özelleştirilmiş)`,
          amount: template.amount,
          type: template.type,
          sectorId: sector.id,
          isActive: true,
          createdAt: new Date(),
          updatedAt: new Date()
        });
        
        sectorIncentives.push(incentive);
        createdIncentives.push({
          sectorId: sector.id,
          sectorName: sector.name,
          incentiveId: incentive.id,
          incentiveTitle: incentive.name,
          amount: incentive.amount,
          type: incentive.type
        });
        
        totalCreated++;
      }
      
      console.log(`✅ ${sector.name} sektörüne ${sectorIncentives.length} teşvik oluşturuldu:`);
      sectorIncentives.forEach((incentive, index) => {
        console.log(`   ${index + 1}. ${incentive.name} (${incentive.amount.toLocaleString('tr-TR')} TL)`);
      });
    }

    // Özet rapor
    console.log('\n' + '='.repeat(70));
    console.log('📊 TEŞVİK OLUŞTURMA ÖZETİ');
    console.log('='.repeat(70));
    console.log(`Toplam oluşturulan teşvik sayısı: ${totalCreated}`);
    console.log(`Sektör başına teşvik sayısı: ${incentiveTemplates.length}`);
    console.log(`İşlenen sektör sayısı: ${sectors.length}`);

    // Teşvik türü bazında özet
    console.log('\n📈 TEŞVİK TÜRÜ BAZINDA DAĞILIM:');
    const typeStats = {};
    createdIncentives.forEach(incentive => {
      if (!typeStats[incentive.type]) {
        typeStats[incentive.type] = { count: 0, totalAmount: 0 };
      }
      typeStats[incentive.type].count++;
      typeStats[incentive.type].totalAmount += incentive.amount;
    });

    Object.entries(typeStats).forEach(([type, stats]) => {
      console.log(`• ${type}: ${stats.count} adet (Toplam: ${stats.totalAmount.toLocaleString('tr-TR')} TL)`);
    });

    // İlk 10 teşviği detaylı göster
    console.log('\n📋 İLK 10 TEŞVİK DETAYı:');
    createdIncentives.slice(0, 10).forEach((incentive, index) => {
      console.log(`${index + 1}. ${incentive.incentiveTitle} (${incentive.amount.toLocaleString('tr-TR')} TL)`);
    });

    if (createdIncentives.length > 10) {
      console.log(`... ve ${createdIncentives.length - 10} teşvik daha`);
    }

    // Toplam teşvik tutarı
    const totalAmount = createdIncentives.reduce((sum, incentive) => sum + incentive.amount, 0);
    console.log(`\n💰 TOPLAM TEŞVİK TUTARI: ${totalAmount.toLocaleString('tr-TR')} TL`);

    console.log('\n✅ Sektör teşvikleri başarıyla oluşturuldu!');

  } catch (error) {
    console.error('Hata:', error);
  } finally {
    await sequelize.close();
  }
}

createIncentivesForSectors();