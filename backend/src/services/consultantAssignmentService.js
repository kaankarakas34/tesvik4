const { User, Sector, IncentiveType, Application, Chat } = require('../models');
const { Op } = require('sequelize');

/**
 * Otomatik danışman atama servisi
 * Sektör bazlı ve yük dengeleme algoritması ile danışman ataması yapar
 */
class ConsultantAssignmentService {
  
  /**
   * Başvuru için en uygun danışmanı bulur ve atar
   * @param {number} applicationId - Başvuru ID'si
   * @param {number} companyId - Şirket ID'si
   * @returns {Object} Atanan danışman bilgisi
   */
  static async assignConsultantToApplication(applicationId, companyId) {
    try {
      // Başvuruyu ve teşviklerini al
      const application = await Application.findByPk(applicationId, {
        include: [{
          model: require('../models').Incentive,
          as: 'incentives',
          include: [{
            model: Sector,
            as: 'sector'
          }, {
            model: IncentiveType,
            as: 'incentiveType',
            include: [{
              model: Sector,
              as: 'sector'
            }]
          }]
        }]
      });

      if (!application) {
        throw new Error('Başvuru bulunamadı');
      }

      // Şirketin sektörünü al
      const company = await User.findByPk(companyId, {
        include: [{
          model: Sector,
          as: 'sector'
        }]
      });

      // Sektör öncelik sırası belirleme
      const sectorPriorities = this.determineSectorPriorities(application, company);
      
      // En uygun danışmanı bul
      const assignedConsultant = await this.findBestConsultant(sectorPriorities);
      
      if (!assignedConsultant) {
        throw new Error('Uygun danışman bulunamadı');
      }

      // Atama geçmişini kaydet
      await this.logAssignment(applicationId, assignedConsultant.id, sectorPriorities[0]);

      return {
        consultant: assignedConsultant,
        assignmentReason: this.getAssignmentReason(assignedConsultant, sectorPriorities),
        sectorMatch: sectorPriorities[0] === assignedConsultant.sectorId
      };

    } catch (error) {
      console.error('Danışman atama hatası:', error);
      throw error;
    }
  }

  /**
   * Sektör öncelik sırasını belirler
   * @param {Object} application - Başvuru objesi
   * @param {Object} company - Şirket objesi
   * @returns {Array} Sektör ID'leri öncelik sırasına göre
   */
  static determineSectorPriorities(application, company) {
    const priorities = [];
    const addedSectors = new Set();

    // 1. Öncelik: Teşvik türlerinin sektörleri
    if (application.incentives) {
      application.incentives.forEach(incentive => {
        if (incentive.incentiveType && incentive.incentiveType.sectorId && !addedSectors.has(incentive.incentiveType.sectorId)) {
          priorities.push(incentive.incentiveType.sectorId);
          addedSectors.add(incentive.incentiveType.sectorId);
        }
        
        // Teşvikin kendi sektörü (eski sistem uyumluluğu)
        if (incentive.sectorId && !addedSectors.has(incentive.sectorId)) {
          priorities.push(incentive.sectorId);
          addedSectors.add(incentive.sectorId);
        }
      });
    }

    // 2. Öncelik: Şirketin sektörü
    if (company && company.sectorId && !addedSectors.has(company.sectorId)) {
      priorities.push(company.sectorId);
      addedSectors.add(company.sectorId);
    }

    // 3. Öncelik: Genel danışmanlar (sektörü olmayan)
    priorities.push(null);

    return priorities;
  }

  /**
   * En uygun danışmanı bulur
   * @param {Array} sectorPriorities - Sektör öncelik listesi
   * @returns {Object} En uygun danışman
   */
  static async findBestConsultant(sectorPriorities) {
    for (const sectorId of sectorPriorities) {
      const consultant = await this.findConsultantBySector(sectorId);
      if (consultant) {
        return consultant;
      }
    }
    return null;
  }

  /**
   * Belirli sektörden danışman bulur (yük dengeleme ile)
   * @param {number|null} sectorId - Sektör ID'si
   * @returns {Object} Danışman
   */
  static async findConsultantBySector(sectorId) {
    const whereClause = {
      role: 'consultant',
      isActive: true
    };

    if (sectorId !== null) {
      whereClause.sectorId = sectorId;
    } else {
      whereClause.sectorId = { [Op.is]: null };
    }

    // Danışmanları yük durumuna göre sırala
    const consultants = await User.findAll({
      where: whereClause,
      include: [{
        model: Chat,
        as: 'consultantChats',
        where: { status: 'active' },
        required: false
      }, {
        model: Sector,
        as: 'sector',
        required: false
      }],
      order: [
        // Önce aktif chat sayısına göre (az olandan çok olana)
        [{ model: Chat, as: 'consultantChats' }, 'id', 'ASC'],
        // Sonra kayıt tarihine göre (eski danışmanlar önce)
        ['createdAt', 'ASC']
      ]
    });

    if (consultants.length === 0) {
      return null;
    }

    // Yük dengeleme: En az aktif chat'i olan danışmanı seç
    let bestConsultant = consultants[0];
    let minActiveChats = bestConsultant.consultantChats ? bestConsultant.consultantChats.length : 0;

    for (const consultant of consultants) {
      const activeChatCount = consultant.consultantChats ? consultant.consultantChats.length : 0;
      if (activeChatCount < minActiveChats) {
        bestConsultant = consultant;
        minActiveChats = activeChatCount;
      }
    }

    return bestConsultant;
  }

  /**
   * Atama geçmişini kaydet
   * @param {number} applicationId - Başvuru ID'si
   * @param {number} consultantId - Danışman ID'si
   * @param {number} primarySectorId - Birincil sektör ID'si
   */
  static async logAssignment(applicationId, consultantId, primarySectorId) {
    // Bu fonksiyon gelecekte atama geçmişi tablosu oluşturulduğunda kullanılabilir
    console.log(`Atama kaydı: Başvuru ${applicationId} -> Danışman ${consultantId} (Sektör: ${primarySectorId})`);
  }

  /**
   * Atama sebebini açıklar
   * @param {Object} consultant - Atanan danışman
   * @param {Array} sectorPriorities - Sektör öncelikleri
   * @returns {string} Atama sebebi
   */
  static getAssignmentReason(consultant, sectorPriorities) {
    if (consultant.sectorId && sectorPriorities.includes(consultant.sectorId)) {
      return `Sektör uzmanlığı (${consultant.sector?.name || 'Bilinmeyen Sektör'})`;
    }
    
    if (!consultant.sectorId) {
      return 'Genel danışman (tüm sektörler)';
    }
    
    return 'Yük dengeleme (uygun sektör uzmanı bulunamadı)';
  }

  /**
   * Danışman istatistiklerini al
   * @param {number} consultantId - Danışman ID'si
   * @returns {Object} İstatistikler
   */
  static async getConsultantStats(consultantId) {
    const consultant = await User.findByPk(consultantId, {
      include: [{
        model: Chat,
        as: 'consultantChats',
        include: [{
          model: Application,
          as: 'chatApplication'
        }]
      }, {
        model: Sector,
        as: 'sector'
      }]
    });

    if (!consultant) {
      return null;
    }

    const totalChats = consultant.consultantChats.length;
    const activeChats = consultant.consultantChats.filter(chat => chat.status === 'active').length;
    const completedChats = consultant.consultantChats.filter(chat => chat.status === 'completed').length;

    return {
      consultantId: consultant.id,
      name: consultant.fullName,
      sector: consultant.sector?.name || 'Genel',
      totalChats,
      activeChats,
      completedChats,
      workload: activeChats // Basit yük göstergesi
    };
  }

  /**
   * Tüm danışmanların yük durumunu al
   * @returns {Array} Danışman yük durumları
   */
  static async getAllConsultantWorkloads() {
    const consultants = await User.findAll({
      where: {
        role: 'consultant',
        isActive: true
      },
      include: [{
        model: Chat,
        as: 'consultantChats',
        where: { status: 'active' },
        required: false
      }, {
        model: Sector,
        as: 'sector',
        required: false
      }]
    });

    return consultants.map(consultant => ({
      id: consultant.id,
      name: consultant.fullName,
      sector: consultant.sector?.name || 'Genel',
      activeChats: consultant.consultantChats ? consultant.consultantChats.length : 0,
      email: consultant.email
    })).sort((a, b) => a.activeChats - b.activeChats);
  }
}

module.exports = ConsultantAssignmentService;