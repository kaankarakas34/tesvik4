const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');

class AuthUtils {
  // Generate access token
  static generateAccessToken(user) {
    return jwt.sign(
      { 
        id: user.id, 
        email: user.email, 
        role: user.role 
      },
      process.env.JWT_SECRET,
      { expiresIn: process.env.JWT_EXPIRE || '24h' }
    );
  }

  // Generate refresh token
  static generateRefreshToken(user) {
    return jwt.sign(
      { 
        id: user.id, 
        tokenVersion: Date.now() 
      },
      process.env.JWT_REFRESH_SECRET,
      { expiresIn: process.env.JWT_REFRESH_EXPIRE || '7d' }
    );
  }

  // Verify access token
  static verifyAccessToken(token) {
    try {
      return jwt.verify(token, process.env.JWT_SECRET);
    } catch (error) {
      throw new Error('Invalid access token');
    }
  }

  // Verify refresh token
  static verifyRefreshToken(token) {
    try {
      return jwt.verify(token, process.env.JWT_REFRESH_SECRET);
    } catch (error) {
      throw new Error('Invalid refresh token');
    }
  }

  // Hash password
  static async hashPassword(password) {
    const saltRounds = 12;
    return await bcrypt.hash(password, saltRounds);
  }

  // Compare password
  static async comparePassword(password, hashedPassword) {
    return await bcrypt.compare(password, hashedPassword);
  }

  // Generate both tokens
  static generateTokens(user) {
    const accessToken = this.generateAccessToken(user);
    const refreshToken = this.generateRefreshToken(user);
    
    return {
      accessToken,
      refreshToken,
      expiresIn: process.env.JWT_EXPIRE || '24h'
    };
  }
}

module.exports = AuthUtils;