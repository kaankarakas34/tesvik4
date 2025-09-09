const express = require('express');
const { authenticateToken } = require('../middleware/auth');
const {
  getAllIncentives,
  getCompanyIncentives,
  getIncentiveById,
  createIncentive,
  updateIncentive,
  deleteIncentive
} = require('../controllers/incentiveController');

const router = express.Router();

// Get all active incentives
router.get('/', authenticateToken, getAllIncentives);

// Get company incentives
router.get('/company', authenticateToken, getCompanyIncentives);

// Get incentive by ID
router.get('/:id', authenticateToken, getIncentiveById);

// Create incentive (admin only)
router.post('/', authenticateToken, createIncentive);

// Update incentive (admin only)
router.put('/:id', authenticateToken, updateIncentive);

// Delete incentive (admin only)
router.delete('/:id', authenticateToken, deleteIncentive);

module.exports = router;