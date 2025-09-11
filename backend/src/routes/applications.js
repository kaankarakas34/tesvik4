const express = require('express');
const { authenticateToken } = require('../middleware/auth');
const {
  getAllApplications,
  getApplicationById,
  createApplication,
  updateApplicationStatus,
  assignConsultant,
  autoAssignConsultant,
  getApplicationStats,
  deleteApplication
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

// Auto assign consultant to application
router.patch('/:id/auto-assign', authenticateToken, autoAssignConsultant);

// Delete application and related conversations
router.delete('/:id', authenticateToken, deleteApplication);

module.exports = router;