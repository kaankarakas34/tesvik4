const { body, validationResult } = require('express-validator');

// Handle validation errors
const handleValidationErrors = (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({
      message: 'Validation hatası',
      errors: errors.array()
    });
  }
  next();
};

// Register validation rules
const validateRegister = [
  body('email')
    .isEmail()
    .withMessage('Geçerli bir email adresi giriniz')
    .normalizeEmail(),
  body('password')
    .isLength({ min: 6 })
    .withMessage('Şifre en az 6 karakter olmalıdır')
    .matches(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/)
    .withMessage('Şifre en az bir küçük harf, bir büyük harf ve bir rakam içermelidir'),
  body('fullName')
    .trim()
    .isLength({ min: 2 })
    .withMessage('İsim en az 2 karakter olmalıdır'),
  body('role')
    .isIn(['company', 'consultant'])
    .withMessage('Geçerli bir rol seçiniz'),
  body('companyName')
    .optional()
    .trim()
    .isLength({ min: 2 })
    .withMessage('Şirket adı en az 2 karakter olmalıdır'),
  body('sector')
    .if(body('role').equals('consultant'))
    .notEmpty()
    .withMessage('Danışman için sektör bilgisi zorunludur'),
  body('phone')
    .optional()
    .isMobilePhone('tr-TR')
    .withMessage('Geçerli bir telefon numarası giriniz'),
  handleValidationErrors
];

// Login validation rules
const validateLogin = [
  body('email')
    .isEmail()
    .withMessage('Geçerli bir email adresi giriniz')
    .normalizeEmail(),
  body('password')
    .notEmpty()
    .withMessage('Şifre gereklidir'),
  handleValidationErrors
];

// Refresh token validation
const validateRefreshToken = [
  body('refreshToken')
    .notEmpty()
    .withMessage('Refresh token gereklidir'),
  handleValidationErrors
];

module.exports = {
  validateRegister,
  validateLogin,
  validateRefreshToken,
  handleValidationErrors
};