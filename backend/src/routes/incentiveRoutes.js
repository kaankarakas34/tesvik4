const express = require('express');
const router = express.Router();
const {
  getAllIncentives,
  getCompanyIncentives,
  getIncentiveById,
  createIncentive,
  updateIncentive,
  deleteIncentive,
  getIncentiveRequiredDocuments,
  getMultipleIncentivesRequiredDocuments
} = require('../controllers/incentiveController');
const { authenticateToken, authorizeRoles } = require('../middleware/auth');

// Tüm teşvikleri getir (herkese açık)
router.get('/', authenticateToken, getAllIncentives);

// Şirket teşviklerini getir (şirket üyeleri için)
router.get('/company', authenticateToken, getCompanyIncentives);

// Teşvik detayını getir
router.get('/:id', authenticateToken, getIncentiveById);

// Teşvik oluştur (sadece admin)
router.post('/', authenticateToken, authorizeRoles('admin'), createIncentive);

// Teşvik güncelle (sadece admin)
router.put('/:id', authenticateToken, authorizeRoles('admin'), updateIncentive);

// Teşvik sil (sadece admin)
router.delete('/:id', authenticateToken, authorizeRoles('admin'), deleteIncentive);

// Teşvik için gerekli belgeleri getir
router.get('/:id/required-documents', authenticateToken, getIncentiveRequiredDocuments);

// Birden fazla teşvik için gerekli belgeleri getir
router.post('/required-documents', authenticateToken, getMultipleIncentivesRequiredDocuments);

module.exports = router;