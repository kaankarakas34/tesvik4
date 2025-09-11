const bcrypt = require('bcryptjs');
const { v4: uuidv4 } = require('uuid');
const { User, Incentive, Document } = require('./src/models');

async function createTestUsers() {
  try {
    console.log('🧪 Creating test users for Teşvik360...\n');

    // Admin Users
    console.log('👨‍💼 Creating Admin Users...');
    
    const adminPassword = await bcrypt.hash('admin123', 12);
    const admin = await User.findOrCreate({
      where: { email: 'admin@tesvik360.com' },
      defaults: {
        id: uuidv4(),
        email: 'admin@tesvik360.com',
        password: adminPassword,
        fullName: 'System Administrator',
        role: 'admin',
        status: 'active',
        phone: '+90 555 000 00 01'
      }
    });

    // Company Users
    console.log('🏢 Creating Company Users...');
    
    const companyUsers = [
      {
        email: 'demo@akintechnology.com',
        fullName: 'Mehmet Akın',
        companyName: 'Akın Technology A.Ş.',
        phone: '+90 555 111 11 11',
        status: 'active'
      },
      {
        email: 'info@innovasyon.com',
        fullName: 'Ayşe Yılmaz',
        companyName: 'İnovasyon Yazılım Ltd. Şti.',
        phone: '+90 555 222 22 22',
        status: 'active'
      },
      {
        email: 'contact@digitech.com',
        fullName: 'Emre Özkan',
        companyName: 'DigiTech Solutions A.Ş.',
        phone: '+90 555 333 33 33',
        status: 'pending'
      },
      {
        email: 'admin@greentech.com',
        fullName: 'Zeynep Kara',
        companyName: 'GreenTech Energy Ltd.',
        phone: '+90 555 444 44 44',
        status: 'active'
      }
    ];

    const companyPassword = await bcrypt.hash('company123', 12);
    
    for (const company of companyUsers) {
      await User.findOrCreate({
        where: { email: company.email },
        defaults: {
          id: uuidv4(),
          email: company.email,
          password: companyPassword,
          fullName: company.fullName,
          companyName: company.companyName,
          phone: company.phone,
          role: 'company',
          status: company.status
        }
      });
    }

    // Consultant Users
    console.log('👨‍🏫 Creating Consultant Users...');
    
    const consultantUsers = [
      // Bilişim ve Teknoloji (Sector 1)
      {
        email: 'ahmet@danismanlik.com',
        fullName: 'Ahmet Yılmaz',
        sectorId: 1,
        phone: '+90 555 555 55 55',
        status: 'active'
      },
      {
        email: 'mehmet.tech@consultant.com',
        fullName: 'Mehmet Özkan',
        sectorId: 1,
        phone: '+90 555 555 55 56',
        status: 'active'
      },
      {
        email: 'zeynep.tech@uzman.com',
        fullName: 'Zeynep Demir',
        sectorId: 1,
        phone: '+90 555 555 55 57',
        status: 'active'
      },
      
      // İmalat Sanayi (Sector 2)
      {
        email: 'fatma@tesvikuzman.com',
        fullName: 'Fatma Kaya',
        sectorId: 2,
        phone: '+90 555 666 66 66',
        status: 'active'
      },
      {
        email: 'ali.imalat@consultant.com',
        fullName: 'Ali Şahin',
        sectorId: 2,
        phone: '+90 555 666 66 67',
        status: 'active'
      },
      {
        email: 'ayse.imalat@uzman.com',
        fullName: 'Ayşe Yıldız',
        sectorId: 2,
        phone: '+90 555 666 66 68',
        status: 'active'
      },
      
      // Turizm ve Otelcilik (Sector 3)
      {
        email: 'emre.turizm@consultant.com',
        fullName: 'Emre Çelik',
        sectorId: 3,
        phone: '+90 555 333 33 33',
        status: 'active'
      },
      {
        email: 'selin.turizm@uzman.com',
        fullName: 'Selin Arslan',
        sectorId: 3,
        phone: '+90 555 333 33 34',
        status: 'active'
      },
      {
        email: 'burak.turizm@danismanlik.com',
        fullName: 'Burak Koç',
        sectorId: 3,
        phone: '+90 555 333 33 35',
        status: 'active'
      },
      
      // Tarım ve Hayvancılık (Sector 4)
      {
        email: 'hasan.tarim@consultant.com',
        fullName: 'Hasan Avcı',
        sectorId: 4,
        phone: '+90 555 444 44 44',
        status: 'active'
      },
      {
        email: 'gulsen.tarim@uzman.com',
        fullName: 'Gülşen Polat',
        sectorId: 4,
        phone: '+90 555 444 44 45',
        status: 'active'
      },
      {
        email: 'murat.tarim@danismanlik.com',
        fullName: 'Murat Erdoğan',
        sectorId: 4,
        phone: '+90 555 444 44 46',
        status: 'active'
      },
      
      // İnşaat ve Gayrimenkul (Sector 5)
      {
        email: 'kemal.insaat@consultant.com',
        fullName: 'Kemal Yurt',
        sectorId: 5,
        phone: '+90 555 555 55 55',
        status: 'active'
      },
      {
        email: 'nurcan.insaat@uzman.com',
        fullName: 'Nurcan Başar',
        sectorId: 5,
        phone: '+90 555 555 55 56',
        status: 'active'
      },
      {
        email: 'osman.insaat@danismanlik.com',
        fullName: 'Osman Güler',
        sectorId: 5,
        phone: '+90 555 555 55 57',
        status: 'active'
      },
      
      // Sağlık ve Sosyal Hizmetler (Sector 6)
      {
        email: 'dr.elif@consultant.com',
        fullName: 'Dr. Elif Özkan',
        sectorId: 6,
        phone: '+90 555 666 66 66',
        status: 'active'
      },
      {
        email: 'dr.can@uzman.com',
        fullName: 'Dr. Can Yılmaz',
        sectorId: 6,
        phone: '+90 555 666 66 67',
        status: 'active'
      },
      {
        email: 'dr.pinar@danismanlik.com',
        fullName: 'Dr. Pınar Kara',
        sectorId: 6,
        phone: '+90 555 666 66 68',
        status: 'active'
      },
      
      // Eğitim ve Öğretim (Sector 7)
      {
        email: 'prof.ahmet@consultant.com',
        fullName: 'Prof. Ahmet Doğan',
        sectorId: 7,
        phone: '+90 555 777 77 77',
        status: 'active'
      },
      {
        email: 'dr.melis@uzman.com',
        fullName: 'Dr. Melis Çakır',
        sectorId: 7,
        phone: '+90 555 777 77 78',
        status: 'active'
      },
      {
        email: 'ogr.serkan@danismanlik.com',
        fullName: 'Öğr. Serkan Bulut',
        sectorId: 7,
        phone: '+90 555 777 77 79',
        status: 'active'
      },
      
      // Finans ve Bankacılık (Sector 8)
      {
        email: 'cem.finans@consultant.com',
        fullName: 'Cem Aktaş',
        sectorId: 8,
        phone: '+90 555 888 88 88',
        status: 'active'
      },
      {
        email: 'deniz.finans@uzman.com',
        fullName: 'Deniz Öztürk',
        sectorId: 8,
        phone: '+90 555 888 88 89',
        status: 'active'
      },
      {
        email: 'berna.finans@danismanlik.com',
        fullName: 'Berna Çetin',
        sectorId: 8,
        phone: '+90 555 888 88 90',
        status: 'active'
      },
      
      // Lojistik ve Taşımacılık (Sector 9)
      {
        email: 'volkan.lojistik@consultant.com',
        fullName: 'Volkan Aslan',
        sectorId: 9,
        phone: '+90 555 999 99 99',
        status: 'active'
      },
      {
        email: 'sibel.lojistik@uzman.com',
        fullName: 'Sibel Koray',
        sectorId: 9,
        phone: '+90 555 999 99 98',
        status: 'active'
      },
      {
        email: 'taner.lojistik@danismanlik.com',
        fullName: 'Taner Güven',
        sectorId: 9,
        phone: '+90 555 999 99 97',
        status: 'active'
      },
      
      // Enerji ve Çevre (Sector 10)
      {
        email: 'mustafa@consultant.com',
        fullName: 'Mustafa Enerji',
        sectorId: 10,
        phone: '+90 555 777 77 77',
        status: 'active'
      },
      {
        email: 'ece.enerji@uzman.com',
        fullName: 'Ece Yeşil',
        sectorId: 10,
        phone: '+90 555 101 01 01',
        status: 'active'
      },
      {
        email: 'kaan.enerji@danismanlik.com',
        fullName: 'Kaan Çevre',
        sectorId: 10,
        phone: '+90 555 101 01 02',
        status: 'active'
      },
      
      // Araştırma ve Geliştirme (Sector 23)
      {
        email: 'elif@uzman.com',
        fullName: 'Elif Araştırmacı',
        sectorId: 23,
        phone: '+90 555 888 88 88',
        status: 'active'
      },
      {
        email: 'dr.arge1@consultant.com',
        fullName: 'Dr. Barış İnovasyon',
        sectorId: 23,
        phone: '+90 555 230 23 01',
        status: 'active'
      },
      {
        email: 'dr.arge2@uzman.com',
        fullName: 'Dr. Canan Geliştirme',
        sectorId: 23,
        phone: '+90 555 230 23 02',
        status: 'active'
      }
    ];

    const consultantPassword = await bcrypt.hash('consultant123', 12);
    
    for (const consultant of consultantUsers) {
      await User.findOrCreate({
        where: { email: consultant.email },
        defaults: {
          id: uuidv4(),
          email: consultant.email,
          password: consultantPassword,
          fullName: consultant.fullName,
          sectorId: consultant.sectorId,
          phone: consultant.phone,
          role: 'consultant',
          status: consultant.status
        }
      });
    }

    console.log('\n✅ Test users created successfully!');
    console.log('\n📋 TEST USER CREDENTIALS:');
    console.log('================================');
    
    console.log('\n👨‍💼 ADMIN USER:');
    console.log('📧 Email: admin@tesvik360.com');
    console.log('🔑 Password: admin123');
    console.log('👤 Role: Administrator');
    
    console.log('\n🏢 COMPANY USERS:');
    console.log('📧 Email: demo@akintechnology.com');
    console.log('🔑 Password: company123');
    console.log('🏢 Company: Akın Technology A.Ş.');
    console.log('✅ Status: Active');
    
    console.log('\n📧 Email: info@innovasyon.com');
    console.log('🔑 Password: company123');
    console.log('🏢 Company: İnovasyon Yazılım Ltd. Şti.');
    console.log('✅ Status: Active');
    
    console.log('\n📧 Email: contact@digitech.com');
    console.log('🔑 Password: company123');
    console.log('🏢 Company: DigiTech Solutions A.Ş.');
    console.log('⏳ Status: Pending (Admin approval needed)');
    
    console.log('\n📧 Email: admin@greentech.com');
    console.log('🔑 Password: company123');
    console.log('🏢 Company: GreenTech Energy Ltd.');
    console.log('✅ Status: Active');
    
    console.log('\n👨‍🏫 CONSULTANT USERS (30 danışman):');
    console.log('🔑 Tüm danışmanlar için şifre: consultant123');
    console.log('\n🎯 SEKTÖR BAŞINA DANIŞMAN SAYILARI:');
    console.log('   • Bilişim ve Teknoloji: 3 danışman');
    console.log('   • İmalat Sanayi: 3 danışman');
    console.log('   • Turizm ve Otelcilik: 3 danışman');
    console.log('   • Tarım ve Hayvancılık: 3 danışman');
    console.log('   • İnşaat ve Gayrimenkul: 3 danışman');
    console.log('   • Sağlık ve Sosyal Hizmetler: 3 danışman');
    console.log('   • Eğitim ve Öğretim: 3 danışman');
    console.log('   • Finans ve Bankacılık: 3 danışman');
    console.log('   • Lojistik ve Taşımacılık: 3 danışman');
    console.log('   • Enerji ve Çevre: 3 danışman');
    console.log('   • Araştırma ve Geliştirme: 3 danışman');
    
    console.log('\n📧 ÖRNEK DANIŞMAN GİRİŞLERİ:');
    console.log('📧 Email: ahmet@danismanlik.com (Bilişim)');
    console.log('📧 Email: fatma@tesvikuzman.com (İmalat)');
    console.log('📧 Email: dr.elif@consultant.com (Sağlık)');
    console.log('📧 Email: prof.ahmet@consultant.com (Eğitim)');
    
    console.log('\n================================');
    console.log('🚀 You can now test the system with these users!');
    console.log('💡 Active users can login immediately');
    console.log('⚠️  Pending users need admin approval first');

  } catch (error) {
    console.error('❌ Error creating test users:', error);
  }
}

// Run if called directly
if (require.main === module) {
  createTestUsers().then(() => {
    process.exit(0);
  }).catch((error) => {
    console.error(error);
    process.exit(1);
  });
}

module.exports = createTestUsers;