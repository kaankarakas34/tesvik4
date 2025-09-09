const { v4: uuidv4 } = require('uuid');
const { User, Application, Message } = require('./src/models');

async function seedMessages() {
  try {
    console.log('🌱 Starting message seeding...');

    // Get existing applications and users
    const applications = await Application.findAll({
      include: [{
        model: User,
        as: 'company'
      }]
    });

    if (applications.length === 0) {
      console.log('❌ No applications found. Please run seed-applications.js first.');
      return;
    }

    // Get consultant users
    const consultants = await User.findAll({
      where: { role: 'consultant' }
    });

    if (consultants.length === 0) {
      console.log('ℹ️ No consultants found. Creating a sample consultant...');
      
      const consultant = await User.create({
        id: uuidv4(),
        email: 'consultant@tesvik360.com',
        password: '$2a$12$LQv3c1yqBwEHxv03kpOUCOvRhkgH6Qt8d5GiI1Ow5OQmlk5wCcHRi', // hashed 'consultant123'
        fullName: 'Ahmet Yılmaz',
        role: 'consultant',
        status: 'active',
        phone: '+90 212 555 0505'
      });
      
      consultants.push(consultant);
      console.log('✅ Sample consultant created: consultant@tesvik360.com - Password: consultant123');
    }

    // Create sample messages for each application
    for (const application of applications) {
      const consultant = consultants[0]; // Use first consultant
      
      // Create initial system message
      await Message.create({
        id: uuidv4(),
        conversationId: application.id,
        conversationType: 'application',
        senderId: consultant.id,
        senderType: 'system',
        content: `Teşvik başvurunuz için sohbet başlatıldı. Danışmanınız ${consultant.fullName} size yardımcı olmak için burada.`,
        messageType: 'text',
        isRead: false
      });

      // Create consultant welcome message
      await Message.create({
        id: uuidv4(),
        conversationId: application.id,
        conversationType: 'application',
        senderId: consultant.id,
        senderType: 'consultant',
        content: `Merhaba ${application.company.fullName}! Ben ${consultant.fullName}, teşvik danışmanınızım. Başvurunuzla ilgili sorularınızı yanıtlamak için buradayım. Nasıl yardımcı olabilirim?`,
        messageType: 'text',
        isRead: false
      });

      // Create a sample company response
      await Message.create({
        id: uuidv4(),
        conversationId: application.id,
        conversationType: 'application',
        senderId: application.companyId,
        senderType: 'user',
        content: 'Merhaba! Teşvik başvurumuzun durumu hakkında bilgi alabilir miyim? Hangi belgeler eksik?',
        messageType: 'text',
        isRead: false
      });

      console.log(`✅ Messages created for application ${application.id}`);
    }

    console.log('🎉 Message seeding completed successfully!');

  } catch (error) {
    console.error('❌ Message seeding error:', error);
  }
}

// Run if called directly
if (require.main === module) {
  seedMessages().then(() => {
    process.exit(0);
  }).catch((error) => {
    console.error(error);
    process.exit(1);
  });
}

module.exports = seedMessages;