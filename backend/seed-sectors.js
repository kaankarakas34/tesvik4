const { Sector } = require('./src/models');

const sectorData = [
  {
    name: 'Bilişim ve Teknoloji',
    description: 'Yazılım geliştirme, bilgi işlem, e-ticaret, dijital pazarlama ve teknoloji tabanlı hizmetler'
  },
  {
    name: 'İmalat Sanayi',
    description: 'Makine imalatı, otomotiv, tekstil, gıda işleme, kimya ve diğer üretim faaliyetleri'
  },
  {
    name: 'Turizm ve Otelcilik',
    description: 'Konaklama, yiyecek-içecek, seyahat acenteleri, rehberlik ve turizm hizmetleri'
  },
  {
    name: 'Tarım ve Hayvancılık',
    description: 'Bitkisel üretim, hayvancılık, su ürünleri, ormancılık ve tarıma dayalı sanayi'
  },
  {
    name: 'İnşaat ve Gayrimenkul',
    description: 'Yapı inşaatı, altyapı projeleri, gayrimenkul geliştirme ve emlak hizmetleri'
  },
  {
    name: 'Sağlık ve Sosyal Hizmetler',
    description: 'Hastane, klinik, eczane, tıbbi cihaz, yaşlı bakımı ve sağlık hizmetleri'
  },
  {
    name: 'Eğitim ve Öğretim',
    description: 'Okul öncesi, ilköğretim, ortaöğretim, yükseköğretim, kurs ve eğitim hizmetleri'
  },
  {
    name: 'Finans ve Bankacılık',
    description: 'Bankacılık, sigorta, yatırım danışmanlığı, muhasebe ve finansal hizmetler'
  },
  {
    name: 'Lojistik ve Taşımacılık',
    description: 'Kargo, nakliye, depolama, dağıtım ve ulaştırma hizmetleri'
  },
  {
    name: 'Enerji ve Çevre',
    description: 'Yenilenebilir enerji, elektrik üretimi, çevre teknolojileri ve sürdürülebilirlik'
  },
  {
    name: 'Perakende ve Toptan Ticaret',
    description: 'Mağazacılık, süpermarket, toptan satış, e-ticaret ve ticaret hizmetleri'
  },
  {
    name: 'Medya ve İletişim',
    description: 'Gazetecilik, televizyon, radyo, dijital medya, reklam ve halkla ilişkiler'
  },
  {
    name: 'Sanat ve Kültür',
    description: 'Müze, tiyatro, sinema, müzik, el sanatları ve kültürel etkinlikler'
  },
  {
    name: 'Spor ve Rekreasyon',
    description: 'Spor kulüpleri, fitness, eğlence merkezleri, oyun ve rekreasyon hizmetleri'
  },
  {
    name: 'Hukuk ve Danışmanlık',
    description: 'Avukatlık, hukuki danışmanlık, noter, icra ve hukuki hizmetler'
  },
  {
    name: 'Güvenlik Hizmetleri',
    description: 'Özel güvenlik, alarm sistemleri, kamera sistemleri ve güvenlik teknolojileri'
  },
  {
    name: 'Temizlik ve Bakım',
    description: 'Temizlik hizmetleri, bahçıvanlık, bakım-onarım ve tesis yönetimi'
  },
  {
    name: 'Gıda ve İçecek',
    description: 'Restoran, kafe, catering, gıda üretimi ve içecek hizmetleri'
  },
  {
    name: 'Kozmetik ve Kişisel Bakım',
    description: 'Kuaförlük, güzellik salonu, spa, kozmetik ürünleri ve kişisel bakım'
  },
  {
    name: 'Maden ve Jeoloji',
    description: 'Maden çıkarma, jeolojik araştırma, harita ve maden işletmeciliği'
  },
  {
    name: 'Denizcilik ve Su Ürünleri',
    description: 'Gemi işletmeciliği, balıkçılık, su ürünleri yetiştiriciliği ve deniz ulaştırması'
  },
  {
    name: 'Havacılık ve Uzay',
    description: 'Havayolu işletmeciliği, havacılık teknolojileri, uzay araştırmaları ve savunma'
  },
  {
    name: 'Araştırma ve Geliştirme',
    description: 'Bilimsel araştırma, Ar-Ge faaliyetleri, laboratuvar hizmetleri ve inovasyon'
  },
  {
    name: 'Sosyal Sorumluluk ve STK',
    description: 'Sivil toplum kuruluşları, vakıf, dernek ve sosyal sorumluluk projeleri'
  },
  {
    name: 'Diğer Hizmet Sektörleri',
    description: 'Yukarıdaki kategorilere girmeyen diğer hizmet ve ticaret alanları'
  }
];

async function seedSectors() {
  try {
    console.log('🌱 Sektör verileri ekleniyor...');

    // Check if sectors already exist
    const existingSectorCount = await Sector.count();
    if (existingSectorCount > 0) {
      console.log(`⚠️  Veritabanında zaten ${existingSectorCount} sektör mevcut.`);
      console.log('Mevcut sektörleri silmek ve yeniden eklemek için önce veritabanını temizleyin.');
      return;
    }

    // Create sectors
    const createdSectors = await Sector.bulkCreate(sectorData, {
      validate: true,
      returning: true
    });

    console.log(`✅ ${createdSectors.length} sektör başarıyla eklendi:`);
    createdSectors.forEach((sector, index) => {
      console.log(`   ${index + 1}. ${sector.name}`);
    });

    console.log('\n🎉 Sektör verileri başarıyla yüklendi!');
  } catch (error) {
    console.error('❌ Sektör verileri eklenirken hata oluştu:', error);
    
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
  seedSectors().then(() => {
    process.exit(0);
  }).catch(error => {
    console.error('Script hatası:', error);
    process.exit(1);
  });
}

module.exports = { seedSectors, sectorData };