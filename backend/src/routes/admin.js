const express = require('express');
const { authenticateToken, authorizeRoles } = require('../middleware/auth');
const {
  getAllUsers,
  updateUserStatus,
  updateUserRole,
  updateUserSector,
  updateUser,
  deleteUser,
  getUserStats,
  assignConsultantsToSectors,
  getSectorDistribution,
  assignMembersToSectors,
  getCompanies,
  getCompanyMembers,
  assignSectorsToAllUsers,
  getConsultantCompanies,
  getConsultantCompanyMembers,
  assignConsultantsToCompanies
} = require('../controllers/adminController');

const router = express.Router();

// Test route without auth - MUST be before middleware
router.get('/no-auth-test', (req, res) => {
  res.json({ message: 'No auth test works!' });
});

// Apply auth middleware to all routes below this point
router.use(authenticateToken);
router.use(authorizeRoles('admin'));

// User management routes
router.get('/users', getAllUsers);
router.get('/users/stats', getUserStats);
router.put('/users/:id/status', updateUserStatus);
router.put('/users/:id/role', updateUserRole);
router.put('/users/:id/sector', updateUserSector);
router.put('/users/:id', updateUser);
router.delete('/users/:id', deleteUser);

// Sector assignment routes
router.post('/assign-consultants-to-sectors', assignConsultantsToSectors);
router.get('/sector-distribution', getSectorDistribution);
router.post('/assign-members-to-sectors', assignMembersToSectors);
router.post('/assign-sectors-to-all-users', assignSectorsToAllUsers);

// Test endpoint
router.get('/test', (req, res) => {
  res.json({ message: 'Admin test endpoint works!', user: req.user });
});

// Test route with simple response
router.get('/test-simple', (req, res) => {
  res.json({ message: 'Simple test works!' });
});

// Company management routes
router.get('/companies', (req, res) => {
  console.log('Companies endpoint called');
  getCompanies(req, res);
});
router.get('/companies/:companyName/members', getCompanyMembers);

// Consultant company management routes
router.get('/consultant-companies', getConsultantCompanies);
router.get('/consultant-companies/:companyId/members', getConsultantCompanyMembers);
router.post('/assign-consultants-to-companies', assignConsultantsToCompanies);

module.exports = router;