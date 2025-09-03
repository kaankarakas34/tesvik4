const express = require('express');
const { authenticateToken, authorizeRoles } = require('../middleware/auth');

const router = express.Router();

// Get all users
router.get('/', authenticateToken, (req, res) => {
  // Mock data for now
  const mockUsers = [
    {
      id: '1',
      fullName: 'Ahmet Yılmaz',
      email: 'ahmet@example.com',
      role: 'company',
      companyName: 'ABC Teknoloji',
      sector: 'Teknoloji',
      status: 'active',
      createdAt: '2024-01-15T10:00:00Z'
    },
    {
      id: '2',
      fullName: 'Mehmet Demir',
      email: 'mehmet@example.com',
      role: 'consultant',
      status: 'active',
      createdAt: '2024-01-10T09:00:00Z'
    },
    {
      id: '3',
      fullName: 'Ayşe Kaya',
      email: 'ayse@example.com',
      role: 'company',
      companyName: 'XYZ İnşaat',
      sector: 'İnşaat',
      status: 'pending',
      createdAt: '2024-01-20T14:30:00Z'
    }
  ];
  
  res.json(mockUsers);
});

// Get current user info
router.get('/me', authenticateToken, (req, res) => {
  res.json({ user: req.user });
});

module.exports = router;