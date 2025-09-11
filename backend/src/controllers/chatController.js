const { Chat, Message, User, Application, Document, UploadedDocument } = require('../models');
const { Op } = require('sequelize');
const ConsultantAssignmentService = require('../services/consultantAssignmentService');

// Get chat by application ID
const getChatByApplication = async (req, res) => {
  try {
    const { applicationId } = req.params;
    const userId = req.user.id;
    const userRole = req.user.role;

    // Find or create chat for the application
    let chat = await Chat.findOne({
      where: { applicationId },
      include: [
        {
          model: Application,
          as: 'chatApplication',
          include: [{
            model: User,
            as: 'company'
          }]
        },
        {
          model: User,
          as: 'chatConsultant'
        }
      ]
    });

    if (!chat) {
      // Create new chat if it doesn't exist
      const application = await Application.findByPk(applicationId, {
        include: [{ model: User, as: 'company' }]
      });

      if (!application) {
        return res.status(404).json({ message: 'Başvuru bulunamadı' });
      }

      // Check if user has permission to access this application
      if (userRole === 'company' && application.companyId !== userId) {
        return res.status(403).json({ message: 'Bu başvuruya erişim yetkiniz yok' });
      }

      // Auto-assign consultant if not already assigned
      let assignedConsultantId = userRole === 'consultant' ? userId : null;
      
      if (!assignedConsultantId && userRole === 'company') {
        try {
          // Use the new consultant assignment service
          const assignmentResult = await ConsultantAssignmentService.assignConsultantToApplication(
            applicationId, 
            application.companyId
          );
          
          if (assignmentResult && assignmentResult.consultant) {
            assignedConsultantId = assignmentResult.consultant.id;
            console.log(`Danışman atandı: ${assignmentResult.consultant.fullName} - ${assignmentResult.assignmentReason}`);
          }
        } catch (assignmentError) {
          console.error('Otomatik danışman atama hatası:', assignmentError);
          
          // Fallback: Find any available consultant
          const fallbackConsultant = await User.findOne({
            where: { 
              role: 'consultant',
              isActive: true 
            },
            order: [['createdAt', 'ASC']]
          });
          
          if (fallbackConsultant) {
            assignedConsultantId = fallbackConsultant.id;
            console.log(`Fallback danışman atandı: ${fallbackConsultant.fullName}`);
          }
        }
      }

      chat = await Chat.create({
        applicationId,
        userId: application.companyId,
        consultantId: assignedConsultantId,
        status: 'active',
        title: `${application.company.companyName || application.company.fullName} - Teşvik Başvurusu`
      });

      // Reload with associations
      chat = await Chat.findByPk(chat.id, {
        include: [
          {
            model: Application,
            as: 'chatApplication',
            include: [{
              model: User,
              as: 'company'
            }]
          },
          {
            model: User,
            as: 'chatConsultant'
          }
        ]
      });
    }

    // Check permissions
    if (userRole === 'company' && chat.userId !== userId) {
      return res.status(403).json({ message: 'Bu sohbete erişim yetkiniz yok' });
    }

    if (userRole === 'consultant' && chat.consultantId !== userId && userRole !== 'admin') {
      return res.status(403).json({ message: 'Bu sohbete erişim yetkiniz yok' });
    }

    res.json({ chat });
  } catch (error) {
    console.error('Get chat error:', error);
    res.status(500).json({ message: 'Sohbet bilgileri alınırken hata oluştu' });
  }
};

// Get messages for a chat
const getMessages = async (req, res) => {
  try {
    const { chatId } = req.params;
    const { page = 1, limit = 50 } = req.query;
    const userId = req.user.id;
    const userRole = req.user.role;

    // Check if user has access to this chat
    const chat = await Chat.findByPk(chatId);
    if (!chat) {
      return res.status(404).json({ message: 'Sohbet bulunamadı' });
    }

    // Check permissions
    if (userRole === 'company' && chat.userId !== userId) {
      return res.status(403).json({ message: 'Bu sohbete erişim yetkiniz yok' });
    }

    if (userRole === 'consultant' && chat.consultantId !== userId && userRole !== 'admin') {
      return res.status(403).json({ message: 'Bu sohbete erişim yetkiniz yok' });
    }

    const offset = (page - 1) * limit;

    const messages = await Message.findAndCountAll({
      where: { 
        conversationId: chat.applicationId,
        conversationType: 'application'
      },
      include: [{
        model: User,
        as: 'sender',
        attributes: ['id', 'fullName', 'role']
      }],
      order: [['createdAt', 'DESC']],
      limit: parseInt(limit),
      offset: parseInt(offset)
    });

    res.json({
      messages: messages.rows.reverse(), // Reverse to show oldest first
      totalCount: messages.count,
      currentPage: parseInt(page),
      totalPages: Math.ceil(messages.count / limit)
    });
  } catch (error) {
    console.error('Get messages error:', error);
    res.status(500).json({ message: 'Mesajlar alınırken hata oluştu' });
  }
};

// Send a message
const sendMessage = async (req, res) => {
  try {
    const { chatId } = req.params;
    const { content, type = 'text' } = req.body;
    const userId = req.user.id;
    const userRole = req.user.role;

    if (!content || content.trim() === '') {
      return res.status(400).json({ message: 'Mesaj içeriği boş olamaz' });
    }

    // Check if user has access to this chat
    const chat = await Chat.findByPk(chatId);
    if (!chat) {
      return res.status(404).json({ message: 'Sohbet bulunamadı' });
    }

    // Check permissions
    if (userRole === 'company' && chat.userId !== userId) {
      return res.status(403).json({ message: 'Bu sohbete mesaj gönderme yetkiniz yok' });
    }

    if (userRole === 'consultant' && chat.consultantId !== userId && userRole !== 'admin') {
      return res.status(403).json({ message: 'Bu sohbete mesaj gönderme yetkiniz yok' });
    }

    // Create message
    const message = await Message.create({
      conversationId: chat.applicationId,
      conversationType: 'application',
      senderId: userId,
      senderType: userRole === 'consultant' ? 'consultant' : 'user',
      content: content.trim(),
      messageType: type,
      isRead: false
    });

    // Load message with sender info
    const messageWithSender = await Message.findByPk(message.id, {
      include: [{
        model: User,
        as: 'sender',
        attributes: ['id', 'fullName', 'role']
      }]
    });

    // Update chat's last message time
    await chat.update({ updatedAt: new Date() });

    res.status(201).json({ message: messageWithSender });
  } catch (error) {
    console.error('Send message error:', error);
    res.status(500).json({ message: 'Mesaj gönderilirken hata oluştu' });
  }
};

// Get user's chats
const getUserChats = async (req, res) => {
  try {
    const userId = req.user.id;
    const userRole = req.user.role;

    let whereClause = {};
    if (userRole === 'company') {
      whereClause.userId = userId;
    } else if (userRole === 'consultant') {
      whereClause.consultantId = userId;
    }
    // Admin can see all chats (no where clause)

    const chats = await Chat.findAll({
      where: whereClause,
      include: [
        {
          model: Application,
          as: 'chatApplication',
          include: [{
            model: User,
            as: 'company',
            attributes: ['id', 'fullName', 'companyName']
          }]
        },
        {
          model: User,
          as: 'chatConsultant',
          attributes: ['id', 'fullName']
        },

      ],
      order: [['updatedAt', 'DESC']]
    });

    res.json({ chats });
  } catch (error) {
    console.error('Get user chats error:', error);
    res.status(500).json({ message: 'Sohbetler alınırken hata oluştu' });
  }
};

// Mark messages as read
const markMessagesAsRead = async (req, res) => {
  try {
    const { chatId } = req.params;
    const userId = req.user.id;
    const userRole = req.user.role;

    // Check if user has access to this chat
    const chat = await Chat.findByPk(chatId);
    if (!chat) {
      return res.status(404).json({ message: 'Sohbet bulunamadı' });
    }

    // Check permissions
    if (userRole === 'company' && chat.userId !== userId) {
      return res.status(403).json({ message: 'Bu sohbete erişim yetkiniz yok' });
    }

    if (userRole === 'consultant' && chat.consultantId !== userId && userRole !== 'admin') {
      return res.status(403).json({ message: 'Bu sohbete erişim yetkiniz yok' });
    }

    // Mark all messages in this chat as read for this user
    await Message.update(
      { isRead: true, readAt: new Date() },
      {
        where: {
          conversationId: chat.applicationId,
          conversationType: 'application',
          senderId: { [Op.ne]: userId }, // Don't mark own messages as read
          isRead: false
        }
      }
    );

    res.json({ message: 'Mesajlar okundu olarak işaretlendi' });
  } catch (error) {
    console.error('Mark messages as read error:', error);
    res.status(500).json({ message: 'Mesajlar okundu olarak işaretlenirken hata oluştu' });
  }
};

// Get unread message count
const getUnreadCount = async (req, res) => {
  try {
    const userId = req.user.id;
    const userRole = req.user.role;

    let chatWhereClause = {};
    if (userRole === 'company') {
      chatWhereClause.userId = userId;
    } else if (userRole === 'consultant') {
      chatWhereClause.consultantId = userId;
    }

    const unreadCount = await Message.count({
      include: [{
        model: Chat,
        as: 'chat',
        where: chatWhereClause
      }],
      where: {
        senderId: { [Op.ne]: userId },
        status: { [Op.ne]: 'read' }
      }
    });

    res.json({ unreadCount });
  } catch (error) {
    console.error('Get unread count error:', error);
    res.status(500).json({ message: 'Okunmamış mesaj sayısı alınırken hata oluştu' });
  }
};

// Şirket konuşmalarını getir (aynı şirkete ait kullanıcılar için)
const getCompanyChats = async (req, res) => {
  try {
    const userId = req.user.id;
    const user = await User.findByPk(userId);

    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'Kullanıcı bulunamadı'
      });
    }

    let whereCondition = {};
    
    // Eğer kullanıcının company_id'si varsa, aynı şirkete ait konuşmaları getir
    if (user.companyId) {
      // Aynı şirkete ait kullanıcıları bul
      const companyMembers = await User.findAll({
        where: { companyId: user.companyId },
        attributes: ['id']
      });
      
      const memberIds = companyMembers.map(member => member.id);
      
      // Bu kullanıcıların konuşmalarını getir
      whereCondition = {
        [Op.or]: [
          { userId: { [Op.in]: memberIds } },
          { consultantId: { [Op.in]: memberIds } }
        ]
      };
    } else {
      // Eğer company_id yoksa, sadece kendi konuşmalarını getir
      whereCondition = {
        [Op.or]: [
          { userId: userId },
          { consultantId: userId }
        ]
      };
    }

    const chats = await Chat.findAll({
      where: whereCondition,
      include: [
        {
          model: Application,
          as: 'chatApplication',
          include: [{
            model: User,
            as: 'company',
            attributes: ['id', 'fullName', 'companyName', 'email']
          }]
        },
        {
          model: User,
          as: 'chatConsultant',
          attributes: ['id', 'fullName', 'email']
        },
        {
          model: Message,
          as: 'chatMessages',
          limit: 1,
          order: [['createdAt', 'DESC']],
          include: [{
            model: User,
            as: 'messageUser',
            attributes: ['id', 'fullName']
          }]
        }
      ],
      order: [['updatedAt', 'DESC']]
    });

    // Okunmamış mesaj sayılarını hesapla
    const chatsWithUnreadCount = await Promise.all(
      chats.map(async (chat) => {
        const unreadCount = await Message.count({
          where: {
            chatId: chat.id,
            userId: { [Op.ne]: userId },
            isRead: false
          }
        });

        return {
          ...chat.toJSON(),
          unreadCount
        };
      })
    );

    res.json({
      success: true,
      data: chatsWithUnreadCount,
      companyId: user.companyId
    });
  } catch (error) {
    console.error('Get company chats error:', error);
    res.status(500).json({
      success: false,
      message: 'Şirket konuşmaları getirilirken hata oluştu'
    });
  }
};

// Get documents for application
const getApplicationDocuments = async (req, res) => {
  try {
    const { applicationId } = req.params;
    const userId = req.user.id;
    const userRole = req.user.role;

    // Check if user has access to this application
    const application = await Application.findByPk(applicationId, {
      include: [{ model: User, as: 'company' }]
    });

    if (!application) {
      return res.status(404).json({ message: 'Başvuru bulunamadı' });
    }

    // Check permissions
    if (userRole === 'company' && application.companyId !== userId) {
      return res.status(403).json({ message: 'Bu başvuruya erişim yetkiniz yok' });
    }

    // Get all required documents
    const allDocuments = await Document.findAll({
      attributes: ['id', 'name', 'description', 'required']
    });

    // Get uploaded documents for this application
    const uploadedDocs = await UploadedDocument.findAll({
      where: { 
        userId: application.companyId
      },
      include: [{
        model: Document,
        as: 'originalDocument',
        attributes: ['id', 'name', 'description']
      }],
      attributes: ['id', 'originalDocumentId', 'fileName', 'uploadDate']
    });

    // Create document status list
    const documents = allDocuments.map(doc => {
      const uploaded = uploadedDocs.find(ud => ud.originalDocumentId === doc.id);
      return {
        id: doc.id,
        name: doc.name,
        type: uploaded ? 'uploaded' : 'missing',
        uploadDate: uploaded ? uploaded.uploadDate : null,
        fileName: uploaded ? uploaded.fileName : null
      };
    });

    res.json({ 
      success: true,
      documents 
    });
  } catch (error) {
    console.error('Get application documents error:', error);
    res.status(500).json({ message: 'Belgeler alınırken hata oluştu' });
  }
};

module.exports = {
  getChatByApplication,
  getMessages,
  sendMessage,
  getUserChats,
  markMessagesAsRead,
  getUnreadCount,
  getCompanyChats,
  getApplicationDocuments
};