const { User, Sector } = require('../models');
const bcrypt = require('bcryptjs');
const { Op } = require('sequelize');

/**
 * Kullanıcı profil yönetimi controller'ı
 */
class UserController {
  
  /**
   * Kullanıcı profilini getir
   */
  static async getProfile(req, res) {
    try {
      const userId = req.user.id;
      
      const user = await User.findByPk(userId, {
        include: [{
          model: Sector,
          as: 'sector',
          attributes: ['id', 'name', 'description']
        }],
        attributes: {
          exclude: ['password', 'refreshToken']
        }
      });

      if (!user) {
        return res.status(404).json({ message: 'Kullanıcı bulunamadı' });
      }

      res.json({
        success: true,
        user: {
          id: user.id,
          email: user.email,
          fullName: user.fullName,
          companyName: user.companyName,
          phone: user.phone,
          role: user.role,
          sectorId: user.sectorId,
          sector: user.sector,
          status: user.status,
          createdAt: user.createdAt,
          updatedAt: user.updatedAt
        }
      });
    } catch (error) {
      console.error('Profil getirme hatası:', error);
      res.status(500).json({ 
        message: 'Profil bilgileri alınırken hata oluştu',
        error: process.env.NODE_ENV === 'development' ? error.message : undefined
      });
    }
  }

  /**
   * Kullanıcı profilini güncelle
   */
  static async updateProfile(req, res) {
    try {
      const userId = req.user.id;
      const { fullName, companyName, phone, sectorId } = req.body;

      // Kullanıcıyı bul
      const user = await User.findByPk(userId);
      if (!user) {
        return res.status(404).json({ message: 'Kullanıcı bulunamadı' });
      }

      // Sektör kontrolü (eğer sectorId verilmişse)
      if (sectorId) {
        const sector = await Sector.findByPk(sectorId);
        if (!sector || !sector.isActive) {
          return res.status(400).json({ message: 'Geçersiz sektör seçimi' });
        }
      }

      // Güncelleme verilerini hazırla
      const updateData = {};
      if (fullName !== undefined) updateData.fullName = fullName;
      if (companyName !== undefined) updateData.companyName = companyName;
      if (phone !== undefined) updateData.phone = phone;
      if (sectorId !== undefined) updateData.sectorId = sectorId || null;

      // Kullanıcıyı güncelle
      await user.update(updateData);

      // Güncellenmiş kullanıcıyı sektör bilgisiyle birlikte getir
      const updatedUser = await User.findByPk(userId, {
        include: [{
          model: Sector,
          as: 'sector',
          attributes: ['id', 'name', 'description']
        }],
        attributes: {
          exclude: ['password', 'refreshToken']
        }
      });

      res.json({
        success: true,
        message: 'Profil başarıyla güncellendi',
        user: {
          id: updatedUser.id,
          email: updatedUser.email,
          fullName: updatedUser.fullName,
          companyName: updatedUser.companyName,
          phone: updatedUser.phone,
          role: updatedUser.role,
          sectorId: updatedUser.sectorId,
          sector: updatedUser.sector,
          status: updatedUser.status,
          createdAt: updatedUser.createdAt,
          updatedAt: updatedUser.updatedAt
        }
      });
    } catch (error) {
      console.error('Profil güncelleme hatası:', error);
      res.status(500).json({ 
        message: 'Profil güncellenirken hata oluştu',
        error: process.env.NODE_ENV === 'development' ? error.message : undefined
      });
    }
  }

  /**
   * Şifre değiştir
   */
  static async changePassword(req, res) {
    try {
      const userId = req.user.id;
      const { currentPassword, newPassword } = req.body;

      // Validasyon
      if (!currentPassword || !newPassword) {
        return res.status(400).json({ message: 'Mevcut şifre ve yeni şifre gerekli' });
      }

      if (newPassword.length < 6) {
        return res.status(400).json({ message: 'Yeni şifre en az 6 karakter olmalı' });
      }

      // Kullanıcıyı bul
      const user = await User.findByPk(userId);
      if (!user) {
        return res.status(404).json({ message: 'Kullanıcı bulunamadı' });
      }

      // Mevcut şifreyi kontrol et
      const isCurrentPasswordValid = await bcrypt.compare(currentPassword, user.password);
      if (!isCurrentPasswordValid) {
        return res.status(400).json({ message: 'Mevcut şifre yanlış' });
      }

      // Yeni şifreyi hashle
      const hashedNewPassword = await bcrypt.hash(newPassword, 12);

      // Şifreyi güncelle
      await user.update({ password: hashedNewPassword });

      res.json({
        success: true,
        message: 'Şifre başarıyla değiştirildi'
      });
    } catch (error) {
      console.error('Şifre değiştirme hatası:', error);
      res.status(500).json({ 
        message: 'Şifre değiştirilirken hata oluştu',
        error: process.env.NODE_ENV === 'development' ? error.message : undefined
      });
    }
  }

  /**
   * Kullanıcı istatistiklerini getir (kendi profili için)
   */
  static async getUserStats(req, res) {
    try {
      const userId = req.user.id;
      const userRole = req.user.role;

      const stats = {
        totalApplications: 0,
        pendingApplications: 0,
        approvedApplications: 0,
        rejectedApplications: 0,
        totalChats: 0,
        activeChats: 0
      };

      if (userRole === 'company') {
        // Şirket kullanıcısı için başvuru istatistikleri
        const { Application } = require('../models');
        
        const applications = await Application.findAll({
          where: { companyId: userId },
          attributes: ['status']
        });

        stats.totalApplications = applications.length;
        stats.pendingApplications = applications.filter(app => app.status === 'pending').length;
        stats.approvedApplications = applications.filter(app => app.status === 'approved').length;
        stats.rejectedApplications = applications.filter(app => app.status === 'rejected').length;

        // Chat istatistikleri
        const { Chat } = require('../models');
        const chats = await Chat.findAll({
          where: { userId: userId },
          attributes: ['status']
        });

        stats.totalChats = chats.length;
        stats.activeChats = chats.filter(chat => chat.status === 'active').length;
      } else if (userRole === 'consultant') {
        // Danışman için chat istatistikleri
        const { Chat } = require('../models');
        const chats = await Chat.findAll({
          where: { consultantId: userId },
          attributes: ['status']
        });

        stats.totalChats = chats.length;
        stats.activeChats = chats.filter(chat => chat.status === 'active').length;
      }

      res.json({
        success: true,
        stats
      });
    } catch (error) {
      console.error('Kullanıcı istatistikleri hatası:', error);
      res.status(500).json({ 
        message: 'İstatistikler alınırken hata oluştu',
        error: process.env.NODE_ENV === 'development' ? error.message : undefined
      });
    }
  }

  /**
   * Kullanıcı sektörünü güncelle (özel endpoint)
   */
  static async updateUserSector(req, res) {
    try {
      const userId = req.user.id;
      const { sectorId } = req.body;

      // Sektör kontrolü
      if (sectorId) {
        const sector = await Sector.findByPk(sectorId);
        if (!sector || !sector.isActive) {
          return res.status(400).json({ message: 'Geçersiz sektör seçimi' });
        }
      }

      // Kullanıcıyı güncelle
      const user = await User.findByPk(userId);
      if (!user) {
        return res.status(404).json({ message: 'Kullanıcı bulunamadı' });
      }

      await user.update({ sectorId: sectorId || null });

      // Güncellenmiş kullanıcıyı sektör bilgisiyle birlikte getir
      const updatedUser = await User.findByPk(userId, {
        include: [{
          model: Sector,
          as: 'sector',
          attributes: ['id', 'name', 'description']
        }],
        attributes: {
          exclude: ['password', 'refreshToken']
        }
      });

      res.json({
        success: true,
        message: 'Sektör bilgisi başarıyla güncellendi',
        user: {
          id: updatedUser.id,
          sectorId: updatedUser.sectorId,
          sector: updatedUser.sector
        }
      });
    } catch (error) {
      console.error('Sektör güncelleme hatası:', error);
      res.status(500).json({ 
        message: 'Sektör güncellenirken hata oluştu',
        error: process.env.NODE_ENV === 'development' ? error.message : undefined
      });
    }
  }
}

module.exports = UserController;