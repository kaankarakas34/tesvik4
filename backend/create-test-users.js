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
      {
        email: 'ahmet@danismanlik.com',
        fullName: 'Ahmet Consultant',
        sector: 'Teknoloji ve Yazılım',
        phone: '+90 555 555 55 55',
        status: 'active'
      },
      {
        email: 'fatma@tesvikuzman.com',
        fullName: 'Fatma Expert',
        sector: 'İmalat ve Sanayi',
        phone: '+90 555 666 66 66',
        status: 'active'
      },
      {
        email: 'mustafa@consultant.com',
        fullName: 'Mustafa Advisor',
        sector: 'Enerji ve Çevre',
        phone: '+90 555 777 77 77',
        status: 'pending'
      },
      {
        email: 'elif@uzman.com',
        fullName: 'Elif Specialist',
        sector: 'Ar-Ge ve İnovasyon',
        phone: '+90 555 888 88 88',
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
          sector: consultant.sector,
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
    
    console.log('\n👨‍🏫 CONSULTANT USERS:');
    console.log('📧 Email: ahmet@danismanlik.com');
    console.log('🔑 Password: consultant123');
    console.log('🎯 Sector: Teknoloji ve Yazılım');
    console.log('✅ Status: Active');
    
    console.log('\n📧 Email: fatma@tesvikuzman.com');
    console.log('🔑 Password: consultant123');
    console.log('🎯 Sector: İmalat ve Sanayi');
    console.log('✅ Status: Active');
    
    console.log('\n📧 Email: mustafa@consultant.com');
    console.log('🔑 Password: consultant123');
    console.log('🎯 Sector: Enerji ve Çevre');
    console.log('⏳ Status: Pending (Admin approval needed)');
    
    console.log('\n📧 Email: elif@uzman.com');
    console.log('🔑 Password: consultant123');
    console.log('🎯 Sector: Ar-Ge ve İnovasyon');
    console.log('✅ Status: Active');
    
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