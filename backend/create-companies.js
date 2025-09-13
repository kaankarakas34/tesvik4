const { User, Sector, sequelize } = require('./src/models');
const bcrypt = require('bcryptjs');
const { v4: uuidv4 } = require('uuid');

async function createCompanies() {
  try {
    await sequelize.authenticate();
    console.log('Veritabanı bağlantısı başarılı.');

    // Mevcut şirket üyesi sayısını kontrol et
    const currentCompanies = await User.count({ where: { role: 'company' } });
    console.log(`Mevcut şirket üyesi sayısı: ${currentCompanies}`);

    // Aktif sektörleri al
    const sectors = await Sector.findAll({ 
      where: { isActive: true },
      attributes: ['id', 'name']
    });
    
    // Her sektöre en az 2 şirket atayabilmek için minimum 50 şirket oluşturalım
    const targetCompanies = Math.max(50, sectors.length * 2);
    const missingCompanies = targetCompanies - currentCompanies;
    
    console.log(`Hedef şirket sayısı: ${targetCompanies}`);
    console.log(`Eksik şirket sayısı: ${missingCompanies}`);

    if (missingCompanies <= 0) {
      console.log('Yeterli şirket üyesi mevcut.');
      return;
    }

    // Şirket isimleri ve sektör örnekleri
    const companyNames = [
      'Teknoloji A.Ş.', 'İnovasyon Ltd.', 'Dijital Çözümler A.Ş.', 'Yazılım Geliştirme Ltd.',
      'İmalat Sanayi A.Ş.', 'Üretim Fabrikası Ltd.', 'Endüstriyel Çözümler A.Ş.', 'Makine İmalat Ltd.',
      'Turizm İşletmeleri A.Ş.', 'Otel Zinciri Ltd.', 'Seyahat Acentesi A.Ş.', 'Konaklama Hizmetleri Ltd.',
      'Tarım Ürünleri A.Ş.', 'Hayvancılık İşletmesi Ltd.', 'Gıda Üretim A.Ş.', 'Organik Tarım Ltd.',
      'İnşaat Firması A.Ş.', 'Gayrimenkul Geliştirme Ltd.', 'Yapı Malzemeleri A.Ş.', 'Mimarlık Bürosu Ltd.',
      'Sağlık Hizmetleri A.Ş.', 'Özel Hastane Ltd.', 'Tıbbi Cihaz A.Ş.', 'Sağlık Teknolojileri Ltd.',
      'Eğitim Kurumları A.Ş.', 'Özel Okul Ltd.', 'Kurs Merkezi A.Ş.', 'Eğitim Teknolojileri Ltd.',
      'Finans Hizmetleri A.Ş.', 'Yatırım Bankası Ltd.', 'Sigorta Şirketi A.Ş.', 'Finansal Danışmanlık Ltd.',
      'Lojistik A.Ş.', 'Kargo Hizmetleri Ltd.', 'Nakliye Firması A.Ş.', 'Depolama Hizmetleri Ltd.',
      'Enerji Üretim A.Ş.', 'Yenilenebilir Enerji Ltd.', 'Çevre Teknolojileri A.Ş.', 'Güneş Enerjisi Ltd.',
      'Perakende Zinciri A.Ş.', 'Toptan Ticaret Ltd.', 'E-ticaret Platformu A.Ş.', 'Mağaza Zinciri Ltd.',
      'Medya Grubu A.Ş.', 'Reklam Ajansı Ltd.', 'Dijital Medya A.Ş.', 'İletişim Hizmetleri Ltd.',
      'Sanat Galerisi A.Ş.', 'Kültür Merkezi Ltd.', 'Müze İşletmesi A.Ş.', 'Etkinlik Organizasyonu Ltd.'
    ];

    const firstNames = ['Ahmet', 'Mehmet', 'Ayşe', 'Fatma', 'Mustafa', 'Emine', 'Ali', 'Hatice', 'Murat', 'Zeynep', 'Hüseyin', 'Elif', 'İbrahim', 'Merve', 'Yusuf', 'Özlem', 'Ömer', 'Seda', 'Burak', 'Gamze'];
    const lastNames = ['Yılmaz', 'Kaya', 'Demir', 'Çelik', 'Şahin', 'Öztürk', 'Aydın', 'Özdemir', 'Arslan', 'Doğan', 'Kılıç', 'Aslan', 'Çetin', 'Kara', 'Koç', 'Kurt', 'Özkan', 'Şimşek', 'Polat', 'Erdoğan'];

    // Eksik şirketleri oluştur
    const companiesToCreate = [];
    const hashedPassword = await bcrypt.hash('company123', 12); // Varsayılan şifre

    for (let i = 1; i <= missingCompanies; i++) {
      const companyNumber = currentCompanies + i;
      const firstName = firstNames[Math.floor(Math.random() * firstNames.length)];
      const lastName = lastNames[Math.floor(Math.random() * lastNames.length)];
      const companyName = companyNames[Math.floor(Math.random() * companyNames.length)];
      
      companiesToCreate.push({
        id: uuidv4(),
        email: `sirket${companyNumber}@tesvik360.com`,
        password: hashedPassword,
        fullName: `${firstName} ${lastName}`,
        companyName: `${companyName} ${companyNumber}`,
        phone: `+90555${String(companyNumber + 1000).padStart(7, '0')}`,
        role: 'company',
        status: 'active',
        createdAt: new Date(),
        updatedAt: new Date()
      });
    }

    // Toplu oluşturma
    const createdCompanies = await User.bulkCreate(companiesToCreate, {
      validate: true,
      individualHooks: false
    });

    console.log(`${createdCompanies.length} yeni şirket üyesi oluşturuldu.`);
    
    // İlk 10 oluşturulan şirketi listele
    console.log('\nOluşturulan şirketlerden örnekler (ilk 10):');
    createdCompanies.slice(0, 10).forEach((company, index) => {
      console.log(`${index + 1}. ${company.fullName} - ${company.companyName} - ${company.email}`);
    });

    console.log(`\n... ve ${createdCompanies.length - 10} şirket daha.`);

  } catch (error) {
    console.error('Hata:', error);
  } finally {
    await sequelize.close();
  }
}

createCompanies();