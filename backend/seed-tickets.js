const { Ticket, TicketMessage, User } = require('./src/models');
const { sequelize } = require('./src/models');

// Ticket kodu üretimi
function generateTicketCode() {
  const timestamp = Date.now().toString(36);
  const random = Math.random().toString(36).substr(2, 5);
  return `TK-${timestamp}-${random}`.toUpperCase();
}

async function seedTickets() {
  try {
    console.log('🎫 Ticket verileri oluşturuluyor...');

    // Önce mevcut kullanıcıları alalım
    const consultants = await User.findAll({
      where: { role: 'consultant' },
      limit: 3
    });

    const admins = await User.findAll({
      where: { role: 'admin' },
      limit: 2
    });

    if (consultants.length === 0) {
      console.log('❌ Danışman kullanıcı bulunamadı!');
      return;
    }

    if (admins.length === 0) {
      console.log('❌ Admin kullanıcı bulunamadı!');
      return;
    }

    // Örnek ticket verileri
    const ticketData = [
      {
        title: 'Teşvik başvuru süreci hakkında soru',
        description: 'Merhaba, müşterim KOSGEB teşviki için başvuru yapmak istiyor ancak gerekli belgeler konusunda kafam karışık. Hangi belgelerin mutlaka olması gerekiyor ve süreç ne kadar sürüyor?',
        priority: 'medium',
        status: 'open'
      },
      {
        title: 'TÜBİTAK 1512 programı uygunluk kriterleri',
        description: 'Bir müşterim teknoloji geliştirme projesi için TÜBİTAK 1512 programına başvurmak istiyor. Şirket 2 yıllık ama henüz Ar-Ge departmanı yok. Bu durumda başvuru yapabilir mi?',
        priority: 'high',
        status: 'in_progress'
      },
      {
        title: 'İstanbul Kalkınma Ajansı hibesi değerlendirme süreci',
        description: 'İKA hibesi için başvuru yaptık, değerlendirme süreci ne kadar sürüyor? Müşteri sürekli soruyor, bir bilgi verebilir misiniz?',
        priority: 'low',
        status: 'resolved'
      },
      {
        title: 'Girişimcilik desteği yaş sınırı sorunu',
        description: 'Müşterim 45 yaşında ve girişimcilik desteği almak istiyor. Yaş sınırı var mı? Varsa alternatif destekler neler olabilir?',
        priority: 'medium',
        status: 'open'
      },
      {
        title: 'Proje bütçesi hazırlama konusunda yardım',
        description: 'KOSGEB Ar-Ge projesi için bütçe hazırlıyorum. Personel giderleri nasıl hesaplanıyor? SGK primleri dahil mi?',
        priority: 'urgent',
        status: 'in_progress'
      },
      {
        title: 'Patent başvurusu teşvik kapsamı',
        description: 'Müşterimin geliştirdiği ürün için patent başvurusu yapacağız. Bu masraflar hangi teşvik programlarından karşılanabilir?',
        priority: 'medium',
        status: 'closed'
      }
    ];

    // Ticketları oluştur
    const createdTickets = [];
    for (let i = 0; i < ticketData.length; i++) {
      const ticketInfo = ticketData[i];
      const consultant = consultants[i % consultants.length];
      const admin = admins[i % admins.length];

      const ticket = await Ticket.create({
        ticketCode: generateTicketCode(),
        userId: consultant.id,
        title: ticketInfo.title,
        description: ticketInfo.description,
        priority: ticketInfo.priority,
        status: ticketInfo.status,
        assignedAdminId: ['in_progress', 'resolved', 'closed'].includes(ticketInfo.status) ? admin.id : null
      });

      createdTickets.push(ticket);
      console.log(`✅ Ticket oluşturuldu: ${ticket.ticketCode} - ${ticket.title}`);
    }

    // Bazı ticketlara mesajlar ekle (sadece oluşturulan ticketlar için)
    const messageData = [];
    
    if (createdTickets.length >= 2) {
      messageData.push({
        ticketId: createdTickets[1].id, // TÜBİTAK 1512 ticket'ı
        userId: admins[0].id,
        message: 'Merhaba, TÜBİTAK 1512 programı için şirketinizin en az 2 yıllık olması yeterli. Ar-Ge departmanı zorunlu değil, ancak proje ekibinde en az 1 Ar-Ge personeli bulunması gerekiyor. Detaylı bilgi için program çağrı metnini inceleyebilirsiniz.',
        isAdminReply: true
      });
      
      messageData.push({
        ticketId: createdTickets[1].id,
        userId: consultants[Math.min(1, consultants.length - 1)].id,
        message: 'Teşekkürler, çok yardımcı oldu. Proje ekibinde Ar-Ge personeli nasıl tanımlanıyor? Üniversite mezunu olması yeterli mi?',
        isAdminReply: false
      });
    }
    
    if (createdTickets.length >= 3) {
      messageData.push({
        ticketId: createdTickets[2].id, // İKA hibesi ticket'ı
        userId: admins[Math.min(1, admins.length - 1)].id,
        message: 'İKA hibesi değerlendirme süreci genellikle 3-4 ay sürmektedir. Başvuru durumunuzu İKA web sitesinden takip edebilirsiniz.',
        isAdminReply: true
      });
    }
    
    if (createdTickets.length >= 5) {
      messageData.push({
        ticketId: createdTickets[4].id, // Proje bütçesi ticket'ı
        userId: admins[0].id,
        message: 'KOSGEB Ar-Ge projelerinde personel giderleri brüt maaş + SGK işveren payı olarak hesaplanır. Detaylı bütçe şablonunu size mail olarak gönderiyorum.',
        isAdminReply: true
      });
    }
    
    if (createdTickets.length >= 6) {
      messageData.push({
        ticketId: createdTickets[5].id, // Patent ticket'ı
        userId: admins[Math.min(1, admins.length - 1)].id,
        message: 'Patent başvuru masrafları TÜBİTAK TEYDEB programları ve KOSGEB Ar-Ge projeleri kapsamında desteklenebilir. Müşterinizin durumuna göre en uygun programı değerlendirelim.',
        isAdminReply: true
      });
    }

    for (const msgData of messageData) {
      await TicketMessage.create(msgData);
      console.log(`💬 Mesaj eklendi: Ticket ${msgData.ticketId}`);
    }

    console.log(`\n🎉 Toplam ${createdTickets.length} ticket ve ${messageData.length} mesaj oluşturuldu!`);
    console.log('\n📊 Ticket durumları:');
    const statusCounts = {};
    createdTickets.forEach(ticket => {
      statusCounts[ticket.status] = (statusCounts[ticket.status] || 0) + 1;
    });
    Object.entries(statusCounts).forEach(([status, count]) => {
      console.log(`   ${status}: ${count} adet`);
    });

  } catch (error) {
    console.error('❌ Ticket verileri oluşturulurken hata:', error);
  }
}

async function main() {
  try {
    await sequelize.authenticate();
    console.log('✅ Veritabanı bağlantısı başarılı');
    
    await seedTickets();
    
    console.log('\n🏁 Ticket seed işlemi tamamlandı!');
  } catch (error) {
    console.error('❌ Hata:', error);
  } finally {
    await sequelize.close();
  }
}

if (require.main === module) {
  main();
}

module.exports = { seedTickets };