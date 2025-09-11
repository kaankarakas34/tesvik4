const express = require('express');
const UserController = require('../controllers/userController');
const { authenticateToken } = require('../middleware/auth');
const { body, validationResult } = require('express-validator');

const router = express.Router();

// Validation middleware
const handleValidationErrors = (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({
      message: 'Validasyon hatası',
      errors: errors.array()
    });
  }
  next();
};

// Profil güncelleme validasyonları
const profileUpdateValidation = [
  body('fullName')
    .optional()
    .isLength({ min: 2, max: 100 })
    .withMessage('Ad soyad 2-100 karakter arasında olmalı'),
  body('companyName')
    .optional()
    .isLength({ max: 200 })
    .withMessage('Şirket adı maksimum 200 karakter olabilir'),
  body('phone')
    .optional()
    .matches(/^[+]?[0-9\s\-\(\)]{10,20}$/)
    .withMessage('Geçerli bir telefon numarası giriniz'),
  body('sectorId')
    .optional()
    .isInt({ min: 1 })
    .withMessage('Geçerli bir sektör ID giriniz')
];

// Şifre değiştirme validasyonları
const passwordChangeValidation = [
  body('currentPassword')
    .notEmpty()
    .withMessage('Mevcut şifre gerekli'),
  body('newPassword')
    .isLength({ min: 6 })
    .withMessage('Yeni şifre en az 6 karakter olmalı')
    .matches(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/)
    .withMessage('Yeni şifre en az bir küçük harf, bir büyük harf ve bir rakam içermeli')
];

// Sektör güncelleme validasyonu
const sectorUpdateValidation = [
  body('sectorId')
    .optional({ nullable: true })
    .isInt({ min: 1 })
    .withMessage('Geçerli bir sektör ID giriniz')
];

/**
 * @route GET /api/users/profile
 * @desc Kullanıcı profilini getir
 * @access Private
 */
router.get('/profile', authenticateToken, UserController.getProfile);

/**
 * @route PUT /api/users/profile
 * @desc Kullanıcı profilini güncelle
 * @access Private
 */
router.put('/profile', 
  authenticateToken, 
  profileUpdateValidation,
  handleValidationErrors,
  UserController.updateProfile
);

/**
 * @route POST /api/users/change-password
 * @desc Kullanıcı şifresini değiştir
 * @access Private
 */
router.post('/change-password', 
  authenticateToken, 
  passwordChangeValidation,
  handleValidationErrors,
  UserController.changePassword
);

/**
 * @route GET /api/users/stats
 * @desc Kullanıcı istatistiklerini getir
 * @access Private
 */
router.get('/stats', authenticateToken, UserController.getUserStats);

/**
 * @route PATCH /api/users/sector
 * @desc Kullanıcı sektörünü güncelle
 * @access Private
 */
router.patch('/sector', 
  authenticateToken, 
  sectorUpdateValidation,
  handleValidationErrors,
  UserController.updateUserSector
);

module.exports = router;