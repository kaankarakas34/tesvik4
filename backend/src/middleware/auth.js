const AuthUtils = require('../utils/authUtils');
const { User } = require('../models');

// Verify authentication middleware
const authenticateToken = async (req, res, next) => {
  console.log('Auth middleware hit for:', req.method, req.path);
  try {
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1]; // Bearer TOKEN

    if (!token) {
      return res.status(401).json({ 
        message: 'Access token gerekli', 
        code: 'MISSING_TOKEN' 
      });
    }

    const decoded = AuthUtils.verifyAccessToken(token);
    
    // Get user from database
    const user = await User.findByPk(decoded.id);
    if (!user || user.status !== 'active') {
      return res.status(401).json({ 
        message: 'Geçersiz kullanıcı', 
        code: 'INVALID_USER' 
      });
    }

    req.user = user;
    next();
  } catch (error) {
    console.error('Auth middleware error:', error);
    return res.status(401).json({ 
      message: 'Geçersiz access token', 
      code: 'INVALID_TOKEN' 
    });
  }
};

// Role-based authorization middleware
const authorizeRoles = (...roles) => {
  return (req, res, next) => {
    if (!req.user) {
      return res.status(401).json({ 
        message: 'Kimlik doğrulaması gerekli' 
      });
    }

    if (!roles.includes(req.user.role)) {
      return res.status(403).json({ 
        message: 'Bu işlem için yetkiniz yok',
        requiredRoles: roles,
        userRole: req.user.role
      });
    }

    next();
  };
};

// Check if user is active
const requireActiveUser = (req, res, next) => {
  if (!req.user || req.user.status !== 'active') {
    return res.status(403).json({ 
      message: 'Hesabınız aktif değil. Admin onayı bekleniyor.' 
    });
  }
  next();
};

module.exports = {
  authenticateToken,
  authorizeRoles,
  requireActiveUser
};