const express = require('express');
const AuthController = require('../controllers/authController');
const { validateRegister, validateLogin, validateRefreshToken } = require('../middleware/validation');
const { authenticateToken } = require('../middleware/auth');

const router = express.Router();

// Public routes
router.post('/register', validateRegister, AuthController.register);
router.post('/login', validateLogin, AuthController.login);
router.post('/refresh', validateRefreshToken, AuthController.refreshToken);

// Protected routes
router.post('/logout', authenticateToken, AuthController.logout);
router.get('/profile', authenticateToken, AuthController.getProfile);

// Test route
router.get('/test', (req, res) => {
  res.json({ message: 'Auth routes working!' });
});

module.exports = router;