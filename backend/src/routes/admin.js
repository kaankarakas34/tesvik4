const express = require('express');
const { authenticateToken, authorizeRoles } = require('../middleware/auth');
const {
  getAllUsers,
  updateUserStatus,
  updateUserRole,
  updateUserSector,
  deleteUser,
  getUserStats
} = require('../controllers/adminController');

const router = express.Router();

// Admin only routes
router.use(authenticateToken);
router.use(authorizeRoles('admin'));

// User management routes
router.get('/users', getAllUsers);
router.get('/users/stats', getUserStats);
router.put('/users/:id/status', updateUserStatus);
router.put('/users/:id/role', updateUserRole);
router.put('/users/:id/sector', updateUserSector);
router.delete('/users/:id', deleteUser);

module.exports = router;