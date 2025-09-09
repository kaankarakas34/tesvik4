const express = require('express');
const { authenticateToken } = require('../middleware/auth');
const {
  getAllApplications,
  getApplicationById,
  createApplication,
  updateApplicationStatus,
  assignConsultant,
  getApplicationStats
} = require('../controllers/applicationController');

const router = express.Router();

// Get all applications
router.get('/', authenticateToken, getAllApplications);

// Create new application
router.post('/', authenticateToken, createApplication);

// Get application statistics
router.get('/stats', authenticateToken, getApplicationStats);

// Get application by ID
router.get('/:id', authenticateToken, getApplicationById);

// Update application status
router.patch('/:id/status', authenticateToken, updateApplicationStatus);

// Assign consultant to application
router.patch('/:id/assign', authenticateToken, assignConsultant);

module.exports = router;