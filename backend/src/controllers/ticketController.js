const { Ticket, TicketMessage, User } = require('../models');
const { Op } = require('sequelize');

class TicketController {
  // Ticket kodu üretimi
  static generateTicketCode() {
    const timestamp = Date.now().toString(36);
    const random = Math.random().toString(36).substr(2, 5);
    return `TK-${timestamp}-${random}`.toUpperCase();
  }

  // Yeni ticket oluştur (danışmanlar için)
  static async createTicket(req, res) {
    try {
      const { title, description, priority = 'medium' } = req.body;
      const userId = req.user.id;

      // Sadece danışmanlar ticket açabilir
      if (req.user.role !== 'consultant') {
        return res.status(403).json({
          success: false,
          message: 'Sadece danışmanlar ticket açabilir'
        });
      }

      if (!title || !description) {
        return res.status(400).json({
          success: false,
          message: 'Başlık ve açıklama gereklidir'
        });
      }

      const ticketCode = this.generateTicketCode();

      const ticket = await Ticket.create({
        ticketCode,
        userId,
        title,
        description,
        priority,
        status: 'open'
      });

      // Ticket'ı kullanıcı bilgileri ile birlikte getir
      const ticketWithUser = await Ticket.findByPk(ticket.id, {
        include: [
          {
            model: User,
            as: 'user',
            attributes: ['id', 'fullName', 'email', 'role']
          }
        ]
      });

      res.status(201).json({
        success: true,
        message: 'Ticket başarıyla oluşturuldu',
        data: ticketWithUser
      });
    } catch (error) {
      console.error('Ticket oluşturma hatası:', error);
      res.status(500).json({
        success: false,
        message: 'Ticket oluşturulurken hata oluştu'
      });
    }
  }

  // Tüm ticketları getir (admin için)
  static async getAllTickets(req, res) {
    try {
      // Sadece adminler tüm ticketları görebilir
      if (req.user.role !== 'admin') {
        return res.status(403).json({
          success: false,
          message: 'Bu işlem için yetkiniz yok'
        });
      }

      const { page = 1, limit = 10, status, priority } = req.query;
      const offset = (page - 1) * limit;

      const whereClause = {};
      if (status) whereClause.status = status;
      if (priority) whereClause.priority = priority;

      const tickets = await Ticket.findAndCountAll({
        where: whereClause,
        include: [
          {
            model: User,
            as: 'user',
            attributes: ['id', 'fullName', 'email', 'role']
          },
          {
            model: User,
            as: 'assignedAdmin',
            attributes: ['id', 'fullName', 'email'],
            required: false
          }
        ],
        order: [['createdAt', 'DESC']],
        limit: parseInt(limit),
        offset: parseInt(offset)
      });

      res.json({
        success: true,
        data: {
          tickets: tickets.rows,
          totalCount: tickets.count,
          currentPage: parseInt(page),
          totalPages: Math.ceil(tickets.count / limit)
        }
      });
    } catch (error) {
      console.error('Ticketları getirme hatası:', error);
      res.status(500).json({
        success: false,
        message: 'Ticketlar getirilirken hata oluştu'
      });
    }
  }

  // Kullanıcının ticketlarını getir
  static async getUserTickets(req, res) {
    try {
      const userId = req.user.id;
      const { page = 1, limit = 10, status } = req.query;
      const offset = (page - 1) * limit;

      const whereClause = { userId };
      if (status) whereClause.status = status;

      const tickets = await Ticket.findAndCountAll({
        where: whereClause,
        include: [
          {
            model: User,
            as: 'assignedAdmin',
            attributes: ['id', 'fullName', 'email'],
            required: false
          }
        ],
        order: [['createdAt', 'DESC']],
        limit: parseInt(limit),
        offset: parseInt(offset)
      });

      res.json({
        success: true,
        data: {
          tickets: tickets.rows,
          totalCount: tickets.count,
          currentPage: parseInt(page),
          totalPages: Math.ceil(tickets.count / limit)
        }
      });
    } catch (error) {
      console.error('Kullanıcı ticketlarını getirme hatası:', error);
      res.status(500).json({
        success: false,
        message: 'Ticketlar getirilirken hata oluştu'
      });
    }
  }

  // Ticket detayını getir
  static async getTicketById(req, res) {
    try {
      const { id } = req.params;
      const userId = req.user.id;
      const userRole = req.user.role;

      const ticket = await Ticket.findByPk(id, {
        include: [
          {
            model: User,
            as: 'user',
            attributes: ['id', 'fullName', 'email', 'role']
          },
          {
            model: User,
            as: 'assignedAdmin',
            attributes: ['id', 'fullName', 'email'],
            required: false
          },
          {
            model: TicketMessage,
            as: 'messages',
            include: [
              {
                model: User,
                as: 'user',
                attributes: ['id', 'fullName', 'email', 'role']
              }
            ],
            order: [['createdAt', 'ASC']]
          }
        ]
      });

      if (!ticket) {
        return res.status(404).json({
          success: false,
          message: 'Ticket bulunamadı'
        });
      }

      // Yetki kontrolü: sadece ticket sahibi veya admin görebilir
      if (userRole !== 'admin' && ticket.userId !== userId) {
        return res.status(403).json({
          success: false,
          message: 'Bu ticket\'a erişim yetkiniz yok'
        });
      }

      res.json({
        success: true,
        data: ticket
      });
    } catch (error) {
      console.error('Ticket detayını getirme hatası:', error);
      res.status(500).json({
        success: false,
        message: 'Ticket detayı getirilirken hata oluştu'
      });
    }
  }

  // Ticket'a mesaj ekle
  static async addMessage(req, res) {
    try {
      const { id } = req.params;
      const { message } = req.body;
      const userId = req.user.id;
      const userRole = req.user.role;

      if (!message) {
        return res.status(400).json({
          success: false,
          message: 'Mesaj içeriği gereklidir'
        });
      }

      const ticket = await Ticket.findByPk(id);
      if (!ticket) {
        return res.status(404).json({
          success: false,
          message: 'Ticket bulunamadı'
        });
      }

      // Yetki kontrolü: sadece ticket sahibi veya admin mesaj ekleyebilir
      if (userRole !== 'admin' && ticket.userId !== userId) {
        return res.status(403).json({
          success: false,
          message: 'Bu ticket\'a mesaj ekleme yetkiniz yok'
        });
      }

      const ticketMessage = await TicketMessage.create({
        ticketId: id,
        userId,
        message,
        isAdminReply: userRole === 'admin'
      });

      // Mesajı kullanıcı bilgileri ile birlikte getir
      const messageWithUser = await TicketMessage.findByPk(ticketMessage.id, {
        include: [
          {
            model: User,
            as: 'user',
            attributes: ['id', 'fullName', 'email', 'role']
          }
        ]
      });

      // Admin cevap verirse ticket durumunu güncelle
      if (userRole === 'admin' && ticket.status === 'open') {
        await ticket.update({ 
          status: 'in_progress',
          assignedAdminId: userId
        });
      }

      res.status(201).json({
        success: true,
        message: 'Mesaj başarıyla eklendi',
        data: messageWithUser
      });
    } catch (error) {
      console.error('Mesaj ekleme hatası:', error);
      res.status(500).json({
        success: false,
        message: 'Mesaj eklenirken hata oluştu'
      });
    }
  }

  // Ticket durumunu güncelle (admin için)
  static async updateTicketStatus(req, res) {
    try {
      const { id } = req.params;
      const { status, assignedAdminId } = req.body;
      const userRole = req.user.role;

      // Sadece adminler ticket durumunu güncelleyebilir
      if (userRole !== 'admin') {
        return res.status(403).json({
          success: false,
          message: 'Bu işlem için yetkiniz yok'
        });
      }

      const ticket = await Ticket.findByPk(id);
      if (!ticket) {
        return res.status(404).json({
          success: false,
          message: 'Ticket bulunamadı'
        });
      }

      const updateData = {};
      if (status) updateData.status = status;
      if (assignedAdminId !== undefined) updateData.assignedAdminId = assignedAdminId;

      await ticket.update(updateData);

      // Güncellenmiş ticket'ı getir
      const updatedTicket = await Ticket.findByPk(id, {
        include: [
          {
            model: User,
            as: 'user',
            attributes: ['id', 'fullName', 'email', 'role']
          },
          {
            model: User,
            as: 'assignedAdmin',
            attributes: ['id', 'fullName', 'email'],
            required: false
          }
        ]
      });

      res.json({
        success: true,
        message: 'Ticket durumu başarıyla güncellendi',
        data: updatedTicket
      });
    } catch (error) {
      console.error('Ticket durumu güncelleme hatası:', error);
      res.status(500).json({
        success: false,
        message: 'Ticket durumu güncellenirken hata oluştu'
      });
    }
  }
}

module.exports = TicketController;