const express = require('express');
const { authenticateToken, authorizeRoles } = require('../middleware/auth');
const { User, Sector } = require('../models');
const { Op } = require('sequelize');

const router = express.Router();

// Get all users
router.get('/', authenticateToken, async (req, res) => {
  try {
    const { page = 1, limit = 10, role, status, search } = req.query;
    const offset = (page - 1) * limit;
    
    const whereClause = {};
    
    if (role) {
      whereClause.role = role;
    }
    
    if (status) {
      whereClause.status = status;
    }
    
    if (search) {
      whereClause[Op.or] = [
        { fullName: { [Op.iLike]: `%${search}%` } },
        { email: { [Op.iLike]: `%${search}%` } },
        { companyName: { [Op.iLike]: `%${search}%` } }
      ];
    }
    
    const users = await User.findAndCountAll({
      where: whereClause,
      include: [{
        model: Sector,
        as: 'sector',
        attributes: ['id', 'name'],
        required: false
      }],
      attributes: { exclude: ['password', 'refreshToken'] },
      order: [['createdAt', 'DESC']],
      limit: parseInt(limit),
      offset: parseInt(offset)
    });
    
    res.json({
      users: users.rows,
      pagination: {
        currentPage: parseInt(page),
        totalPages: Math.ceil(users.count / limit),
        totalUsers: users.count,
        hasNext: offset + users.rows.length < users.count,
        hasPrev: page > 1
      }
    });
  } catch (error) {
    console.error('Get users error:', error);
    res.status(500).json({ message: 'Kullanıcılar getirilirken hata oluştu' });
  }
});

// Get current user info
router.get('/me', authenticateToken, (req, res) => {
  res.json({ user: req.user });
});

module.exports = router;