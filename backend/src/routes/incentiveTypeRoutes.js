const express = require('express');
const router = express.Router();
const {
  getAllIncentiveTypes,
  getIncentiveTypesBySector,
  createIncentiveType,
  updateIncentiveType,
  deleteIncentiveType,
  getIncentiveTypeCategories
} = require('../controllers/incentiveTypeController');
const { authenticateToken, authorizeRoles } = require('../middleware/auth');

// Public routes
router.get('/categories', getIncentiveTypeCategories);

// Protected routes
router.use(authenticateToken);

// Get all incentive types
router.get('/', getAllIncentiveTypes);

// Get incentive types by sector
router.get('/sector/:sectorId', getIncentiveTypesBySector);

// Admin only routes
router.use(authorizeRoles('admin'));

// Create incentive type
router.post('/', createIncentiveType);

// Update incentive type
router.put('/:id', updateIncentiveType);

// Delete incentive type
router.delete('/:id', deleteIncentiveType);

module.exports = router;