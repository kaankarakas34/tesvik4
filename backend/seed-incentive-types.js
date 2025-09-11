const { IncentiveType, Sector } = require('./src/models');

// Sektör bazlı teşvik türleri hiyerarşisi
const incentiveTypeData = [
  // Bilişim ve Teknoloji Sektörü
  {
    name: 'Yazılım Geliştirme Ar-Ge Desteği',
    description: 'Yazılım geliştirme projelerine yönelik araştırma ve geliştirme desteği',
    sectorName: 'Bilişim ve Teknoloji',
    category: 'ar_ge_destegi',
    priority: 10
  },
  {
    name: 'Teknoloji Transfer Desteği',
    description: 'Teknoloji transferi ve ticarileştirme projelerine destek',
    sectorName: 'Bilişim ve Teknoloji',
    category: 'hibe',
    priority: 9
  },
  {
    name: 'Dijital Dönüşüm Teşviki',
    description: 'Dijital dönüşüm projelerine yönelik vergi indirimi',
    sectorName: 'Bilişim ve Teknoloji',
    category: 'vergi_tesviki',
    priority: 8
  },

  // İmalat Sanayi
  {
    name: 'Üretim Yatırım Teşviki',
    description: 'Üretim tesisi kurulumu ve modernizasyon yatırımları',
    sectorName: 'İmalat Sanayi',
    category: 'yatirim_destegi',
    priority: 10
  },
  {
    name: 'İmalat Sanayi İstihdam Desteği',
    description: 'Üretim sektöründe yeni istihdam oluşturma desteği',
    sectorName: 'İmalat Sanayi',
    category: 'istihdam_destegi',
    priority: 9
  },
  {
    name: 'Makine Teçhizat Kredisi',
    description: 'Üretim makineleri ve ekipman alımı için düşük faizli kredi',
    sectorName: 'İmalat Sanayi',
    category: 'kredi_destegi',
    priority: 8
  },

  // Turizm ve Otelcilik
  {
    name: 'Turizm Yatırım Teşviki',
    description: 'Otel, tatil köyü ve turizm tesisi yatırımları',
    sectorName: 'Turizm ve Otelcilik',
    category: 'yatirim_destegi',
    priority: 10
  },
  {
    name: 'Turizm Tanıtım Desteği',
    description: 'Turizm tanıtım ve pazarlama faaliyetleri desteği',
    sectorName: 'Turizm ve Otelcilik',
    category: 'subvansiyon',
    priority: 9
  },
  {
    name: 'Turizm İstihdam Desteği',
    description: 'Turizm sektöründe sezonluk istihdam desteği',
    sectorName: 'Turizm ve Otelcilik',
    category: 'istihdam_destegi',
    priority: 8
  },

  // Tarım ve Hayvancılık
  {
    name: 'Tarımsal Üretim Desteği',
    description: 'Bitkisel ve hayvansal üretim destekleme ödemeleri',
    sectorName: 'Tarım ve Hayvancılık',
    category: 'subvansiyon',
    priority: 10
  },
  {
    name: 'Tarımsal Ar-Ge Projesi Desteği',
    description: 'Tarımsal araştırma ve geliştirme projelerine destek',
    sectorName: 'Tarım ve Hayvancılık',
    category: 'ar_ge_destegi',
    priority: 9
  },
  {
    name: 'Çiftçi Kredisi',
    description: 'Tarımsal faaliyetler için düşük faizli kredi desteği',
    sectorName: 'Tarım ve Hayvancılık',
    category: 'kredi_destegi',
    priority: 8
  },

  // İnşaat ve Gayrimenkul
  {
    name: 'Konut Yatırım Teşviki',
    description: 'Konut projeleri için yatırım teşviki',
    sectorName: 'İnşaat ve Gayrimenkul',
    category: 'yatirim_destegi',
    priority: 10
  },
  {
    name: 'Yeşil Bina Sertifikası Desteği',
    description: 'Çevre dostu bina projelerine vergi indirimi',
    sectorName: 'İnşaat ve Gayrimenkul',
    category: 'vergi_tesviki',
    priority: 9
  },

  // Sağlık ve Sosyal Hizmetler
  {
    name: 'Sağlık Yatırım Teşviki',
    description: 'Hastane ve sağlık tesisi yatırımları',
    sectorName: 'Sağlık ve Sosyal Hizmetler',
    category: 'yatirim_destegi',
    priority: 10
  },
  {
    name: 'Tıbbi Cihaz Ar-Ge Desteği',
    description: 'Tıbbi cihaz geliştirme projelerine destek',
    sectorName: 'Sağlık ve Sosyal Hizmetler',
    category: 'ar_ge_destegi',
    priority: 9
  },

  // Eğitim ve Öğretim
  {
    name: 'Eğitim Yatırım Teşviki',
    description: 'Okul ve eğitim kurumu yatırımları',
    sectorName: 'Eğitim ve Öğretim',
    category: 'yatirim_destegi',
    priority: 10
  },
  {
    name: 'Mesleki Eğitim Desteği',
    description: 'Mesleki eğitim programları için destek',
    sectorName: 'Eğitim ve Öğretim',
    category: 'hibe',
    priority: 9
  },

  // Enerji ve Çevre
  {
    name: 'Yenilenebilir Enerji Yatırım Teşviki',
    description: 'Güneş, rüzgar ve diğer yenilenebilir enerji yatırımları',
    sectorName: 'Enerji ve Çevre',
    category: 'yatirim_destegi',
    priority: 10
  },
  {
    name: 'Enerji Verimliliği Desteği',
    description: 'Enerji tasarrufu projelerine vergi indirimi',
    sectorName: 'Enerji ve Çevre',
    category: 'vergi_tesviki',
    priority: 9
  },
  {
    name: 'Çevre Teknolojileri Ar-Ge Desteği',
    description: 'Çevre teknolojileri geliştirme projelerine destek',
    sectorName: 'Enerji ve Çevre',
    category: 'ar_ge_destegi',
    priority: 8
  },

  // İhracat Destekleri (Genel)
  {
    name: 'İhracat Pazar Araştırması Desteği',
    description: 'İhracat pazarı araştırma faaliyetleri desteği',
    sectorName: null, // Genel destek
    category: 'ihracat_destegi',
    priority: 8
  },
  {
    name: 'İhracat Kredi Desteği',
    description: 'İhracat finansmanı için kredi desteği',
    sectorName: null, // Genel destek
    category: 'kredi_destegi',
    priority: 7
  },

  // Genel İstihdam Destekleri
  {
    name: 'Genç İstihdam Desteği',
    description: '18-29 yaş arası gençlerin istihdamı için destek',
    sectorName: null, // Genel destek
    category: 'istihdam_destegi',
    priority: 9
  },
  {
    name: 'Kadın İstihdam Desteği',
    description: 'Kadın istihdamını artırma desteği',
    sectorName: null, // Genel destek
    category: 'istihdam_destegi',
    priority: 9
  },
  {
    name: 'Engelli İstihdam Desteği',
    description: 'Engelli bireylerin istihdamı için destek',
    sectorName: null, // Genel destek
    category: 'istihdam_destegi',
    priority: 8
  }
];

async function seedIncentiveTypes() {
  try {
    console.log('🌱 Teşvik türü verileri ekleniyor...');

    // Check if incentive types already exist
    const existingIncentiveTypeCount = await IncentiveType.count();
    if (existingIncentiveTypeCount > 0) {
      console.log(`⚠️  Veritabanında zaten ${existingIncentiveTypeCount} teşvik türü mevcut.`);
      console.log('Mevcut teşvik türlerini silmek ve yeniden eklemek için önce veritabanını temizleyin.');
      return;
    }

    // Get all sectors for mapping
    const sectors = await Sector.findAll();
    const sectorMap = {};
    sectors.forEach(sector => {
      sectorMap[sector.name] = sector.id;
    });

    // Prepare incentive type data with sector IDs
    const incentiveTypesToCreate = incentiveTypeData.map(item => ({
      name: item.name,
      description: item.description,
      sectorId: item.sectorName ? sectorMap[item.sectorName] : null,
      category: item.category,
      priority: item.priority,
      isActive: true
    }));

    // Create incentive types
    const createdIncentiveTypes = await IncentiveType.bulkCreate(incentiveTypesToCreate, {
      validate: true,
      returning: true
    });

    console.log(`✅ ${createdIncentiveTypes.length} teşvik türü başarıyla eklendi:`);
    
    // Group by sector for better display
    const groupedTypes = {};
    for (const incentiveType of createdIncentiveTypes) {
      const sector = incentiveType.sectorId ? 
        sectors.find(s => s.id === incentiveType.sectorId)?.name || 'Bilinmeyen Sektör' : 
        'Genel Destekler';
      
      if (!groupedTypes[sector]) {
        groupedTypes[sector] = [];
      }
      groupedTypes[sector].push(incentiveType.name);
    }

    Object.keys(groupedTypes).forEach(sector => {
      console.log(`\n📂 ${sector}:`);
      groupedTypes[sector].forEach((name, index) => {
        console.log(`   ${index + 1}. ${name}`);
      });
    });

    console.log('\n🎉 Teşvik türü verileri başarıyla yüklendi!');
  } catch (error) {
    console.error('❌ Teşvik türü verileri eklenirken hata oluştu:', error);
    
    if (error.name === 'SequelizeValidationError') {
      console.error('Validasyon hataları:');
      error.errors.forEach(err => {
        console.error(`  - ${err.path}: ${err.message}`);
      });
    }
    
    if (error.name === 'SequelizeUniqueConstraintError') {
      console.error('Benzersizlik kısıtlaması hatası:');
      error.errors.forEach(err => {
        console.error(`  - ${err.path}: ${err.value} zaten mevcut`);
      });
    }
  }
}

// Run if called directly
if (require.main === module) {
  seedIncentiveTypes().then(() => {
    process.exit(0);
  }).catch(error => {
    console.error('Script hatası:', error);
    process.exit(1);
  });
}

module.exports = { seedIncentiveTypes, incentiveTypeData };