const { User } = require('../models');
const { Op } = require('sequelize');

// Get all users with filtering
const getAllUsers = async (req, res) => {
  try {
    const { status, role, page = 1, limit = 10 } = req.query;
    
    // Build where clause for filtering
    const whereClause = {};
    
    if (status) {
      whereClause.status = status;
    }
    
    if (role) {
      whereClause.role = role;
    }
    
    // Calculate offset for pagination
    const offset = (page - 1) * limit;
    
    // Get users with filtering and pagination
    const { count, rows: users } = await User.findAndCountAll({
      where: whereClause,
      attributes: ['id', 'fullName', 'companyName', 'email', 'role', 'status', 'createdAt'],
      order: [['createdAt', 'DESC']],
      limit: parseInt(limit),
      offset: parseInt(offset)
    });
    
    res.json({
      users,
      pagination: {
        currentPage: parseInt(page),
        totalPages: Math.ceil(count / limit),
        totalUsers: count,
        hasNext: offset + users.length < count,
        hasPrev: page > 1
      }
    });
  } catch (error) {
    console.error('Get all users error:', error);
    res.status(500).json({ 
      message: 'Kullanıcılar getirilirken hata oluştu',
      error: error.message 
    });
  }
};

// Update user status
const updateUserStatus = async (req, res) => {
  try {
    const { id } = req.params;
    const { status } = req.body;
    
    // Validate status
    const validStatuses = ['pending', 'active', 'inactive'];
    if (!validStatuses.includes(status)) {
      return res.status(400).json({ 
        message: 'Geçersiz durum değeri',
        validStatuses 
      });
    }
    
    // Find user
    const user = await User.findByPk(id);
    if (!user) {
      return res.status(404).json({ message: 'Kullanıcı bulunamadı' });
    }
    
    // Prevent admin from deactivating themselves
    if (user.id === req.user.id && status === 'inactive') {
      return res.status(400).json({ 
        message: 'Kendi hesabınızı pasife alamazsınız' 
      });
    }
    
    // Update status
    await user.update({ status });
    
    res.json({
      message: 'Kullanıcı durumu güncellendi',
      user: {
        id: user.id,
        fullName: user.fullName,
        email: user.email,
        status: user.status
      }
    });
  } catch (error) {
    console.error('Update user status error:', error);
    res.status(500).json({ 
      message: 'Kullanıcı durumu güncellenirken hata oluştu',
      error: error.message 
    });
  }
};

// Update user role
const updateUserRole = async (req, res) => {
  try {
    const { id } = req.params;
    const { role } = req.body;
    
    // Validate role
    const validRoles = ['company', 'consultant', 'admin'];
    if (!validRoles.includes(role)) {
      return res.status(400).json({ 
        message: 'Geçersiz rol değeri',
        validRoles 
      });
    }
    
    // Find user
    const user = await User.findByPk(id);
    if (!user) {
      return res.status(404).json({ message: 'Kullanıcı bulunamadı' });
    }
    
    // Prevent admin from changing their own role
    if (user.id === req.user.id) {
      return res.status(400).json({ 
        message: 'Kendi rolünüzü değiştiremezsiniz' 
      });
    }
    
    // Update role
    await user.update({ role });
    
    res.json({
      message: 'Kullanıcı rolü güncellendi',
      user: {
        id: user.id,
        fullName: user.fullName,
        email: user.email,
        role: user.role
      }
    });
  } catch (error) {
    console.error('Update user role error:', error);
    res.status(500).json({ 
      message: 'Kullanıcı rolü güncellenirken hata oluştu',
      error: error.message 
    });
  }
};

// Update user sector
const updateUserSector = async (req, res) => {
  try {
    const { id } = req.params;
    const { sector } = req.body;
    
    // Find user
    const user = await User.findByPk(id);
    if (!user) {
      return res.status(404).json({ message: 'Kullanıcı bulunamadı' });
    }
    
    // Update sector
    await user.update({ sector });
    
    res.json({
      message: 'Kullanıcı sektörü güncellendi',
      user: {
        id: user.id,
        fullName: user.fullName,
        email: user.email,
        sector: user.sector
      }
    });
  } catch (error) {
    console.error('Update user sector error:', error);
    res.status(500).json({ 
      message: 'Kullanıcı sektörü güncellenirken hata oluştu',
      error: error.message 
    });
  }
};

// Soft delete user
const deleteUser = async (req, res) => {
  try {
    const { id } = req.params;
    
    // Find user
    const user = await User.findByPk(id);
    if (!user) {
      return res.status(404).json({ message: 'Kullanıcı bulunamadı' });
    }
    
    // Prevent admin from deleting themselves
    if (user.id === req.user.id) {
      return res.status(400).json({ 
        message: 'Kendi hesabınızı silemezsiniz' 
      });
    }
    
    // Soft delete by setting status to inactive
    await user.update({ status: 'inactive' });
    
    res.status(204).send();
  } catch (error) {
    console.error('Delete user error:', error);
    res.status(500).json({ 
      message: 'Kullanıcı silinirken hata oluştu',
      error: error.message 
    });
  }
};

// Get user statistics
const getUserStats = async (req, res) => {
  try {
    const totalUsers = await User.count();
    const pendingUsers = await User.count({ where: { status: 'pending' } });
    const activeUsers = await User.count({ where: { status: 'active' } });
    const companies = await User.count({ where: { role: 'company' } });
    const consultants = await User.count({ where: { role: 'consultant' } });
    
    res.json({
      totalUsers,
      pendingUsers,
      activeUsers,
      companies,
      consultants
    });
  } catch (error) {
    console.error('Get user stats error:', error);
    res.status(500).json({ 
      message: 'İstatistikler getirilirken hata oluştu',
      error: error.message 
    });
  }
};

module.exports = {
  getAllUsers,
  updateUserStatus,
  updateUserRole,
  updateUserSector,
  deleteUser,
  getUserStats
};