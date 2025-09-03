const { User } = require('../models');
const AuthUtils = require('../utils/authUtils');

class AuthController {
  // Register new user
  static async register(req, res) {
    try {
      const { email, password, fullName, role, companyName, sector, phone } = req.body;

      // Check if user already exists
      const existingUser = await User.findOne({ where: { email } });
      if (existingUser) {
        return res.status(409).json({ 
          message: 'Bu email adresi zaten kayıtlı' 
        });
      }

      // Hash password
      const hashedPassword = await AuthUtils.hashPassword(password);

      // Create user
      const user = await User.create({
        email,
        password: hashedPassword,
        fullName,
        role,
        companyName: role === 'company' ? companyName : null,
        sector: role === 'consultant' ? sector : null,
        phone,
        status: role === 'admin' ? 'active' : 'pending' // Admin users are automatically active
      });

      res.status(201).json({
        message: role === 'admin' ? 'Admin kayıt başarılı. Hesabınız aktif.' : 'Kayıt başarılı. Admin onayı bekleniyor.',
        user: {
          id: user.id,
          email: user.email,
          fullName: user.fullName,
          role: user.role,
          status: user.status
        }
      });

    } catch (error) {
      console.error('Register error:', error);
      res.status(500).json({ 
        message: 'Kayıt sırasında bir hata oluştu',
        error: process.env.NODE_ENV === 'development' ? error.message : undefined
      });
    }
  }

  // Login user
  static async login(req, res) {
    try {
      const { email, password } = req.body;

      // Find user
      const user = await User.findOne({ where: { email } });
      if (!user) {
        return res.status(401).json({ 
          message: 'Email veya şifre hatalı' 
        });
      }

      // Check password
      const isValidPassword = await AuthUtils.comparePassword(password, user.password);
      if (!isValidPassword) {
        return res.status(401).json({ 
          message: 'Email veya şifre hatalı' 
        });
      }

      // Check if user is active
      if (user.status !== 'active') {
        return res.status(403).json({ 
          message: 'Hesabınız henüz aktif değil. Admin onayı bekleniyor.',
          status: user.status
        });
      }

      // Generate tokens
      const tokens = AuthUtils.generateTokens(user);

      // Save refresh token
      await user.update({ refreshToken: tokens.refreshToken });

      res.json({
        message: 'Giriş başarılı',
        user: {
          id: user.id,
          email: user.email,
          fullName: user.fullName,
          role: user.role,
          companyName: user.companyName,
          sector: user.sector,
          status: user.status
        },
        ...tokens
      });

    } catch (error) {
      console.error('Login error:', error);
      res.status(500).json({ 
        message: 'Giriş sırasında bir hata oluştu',
        error: process.env.NODE_ENV === 'development' ? error.message : undefined
      });
    }
  }

  // Refresh access token
  static async refreshToken(req, res) {
    try {
      const { refreshToken } = req.body;

      if (!refreshToken) {
        return res.status(401).json({ 
          message: 'Refresh token gerekli' 
        });
      }

      // Verify refresh token
      const decoded = AuthUtils.verifyRefreshToken(refreshToken);

      // Find user and validate refresh token
      const user = await User.findByPk(decoded.id);
      if (!user || user.refreshToken !== refreshToken || user.status !== 'active') {
        return res.status(401).json({ 
          message: 'Geçersiz refresh token' 
        });
      }

      // Generate new access token
      const accessToken = AuthUtils.generateAccessToken(user);

      res.json({
        accessToken,
        expiresIn: process.env.JWT_EXPIRE || '24h'
      });

    } catch (error) {
      console.error('Refresh token error:', error);
      res.status(401).json({ 
        message: 'Geçersiz refresh token',
        error: process.env.NODE_ENV === 'development' ? error.message : undefined
      });
    }
  }

  // Logout user
  static async logout(req, res) {
    try {
      const user = req.user;

      // Clear refresh token
      await user.update({ refreshToken: null });

      res.json({ 
        message: 'Çıkış başarılı' 
      });

    } catch (error) {
      console.error('Logout error:', error);
      res.status(500).json({ 
        message: 'Çıkış sırasında bir hata oluştu',
        error: process.env.NODE_ENV === 'development' ? error.message : undefined
      });
    }
  }

  // Get current user profile
  static async getProfile(req, res) {
    try {
      const user = req.user;

      res.json({
        user: {
          id: user.id,
          email: user.email,
          fullName: user.fullName,
          role: user.role,
          companyName: user.companyName,
          sector: user.sector,
          phone: user.phone,
          status: user.status,
          createdAt: user.createdAt
        }
      });

    } catch (error) {
      console.error('Get profile error:', error);
      res.status(500).json({ 
        message: 'Profil bilgileri alınamadı',
        error: process.env.NODE_ENV === 'development' ? error.message : undefined
      });
    }
  }
}

module.exports = AuthController;