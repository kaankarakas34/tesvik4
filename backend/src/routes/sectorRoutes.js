const express = require('express');
const router = express.Router();
const {
  getAllSectors,
  getSectorById,
  createSector,
  updateSector,
  deleteSector,
  toggleSectorStatus,
  getActiveSectors
} = require('../controllers/sectorController');
const { authenticateToken, authorizeRoles } = require('../middleware/auth');

// Public routes
// Get active sectors (for registration forms, etc.)
router.get('/active', getActiveSectors);

// Protected routes - require authentication
router.use(authenticateToken);

// Admin only routes
router.get('/', authorizeRoles('admin'), getAllSectors);
router.get('/:id', authorizeRoles('admin'), getSectorById);
router.post('/', authorizeRoles('admin'), createSector);
router.put('/:id', authorizeRoles('admin'), updateSector);
router.delete('/:id', authorizeRoles('admin'), deleteSector);
router.patch('/:id/toggle-status', authorizeRoles('admin'), toggleSectorStatus);

module.exports = router;