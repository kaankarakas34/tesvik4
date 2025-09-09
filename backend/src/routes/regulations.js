const express = require('express');
const { authenticateToken, authorizeRoles } = require('../middleware/auth');
const {
  getAllRegulations,
  getRegulationById,
  createRegulation,
  updateRegulation,
  deleteRegulation,
  getRegulationCategories
} = require('../controllers/regulationsController');

const router = express.Router();

// Public routes (for company users to view regulations)
router.get('/', authenticateToken, getAllRegulations);
router.get('/categories', authenticateToken, getRegulationCategories);
router.get('/:id', authenticateToken, getRegulationById);

// Admin only routes
router.post('/', authenticateToken, authorizeRoles('admin'), createRegulation);
router.put('/:id', authenticateToken, authorizeRoles('admin'), updateRegulation);
router.delete('/:id', authenticateToken, authorizeRoles('admin'), deleteRegulation);

module.exports = router;