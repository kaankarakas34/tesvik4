const express = require('express');
const { authenticateToken } = require('../middleware/auth');

const router = express.Router();

// Get applications
router.get('/', authenticateToken, (req, res) => {
  // Mock data for now
  const mockApplications = [
    {
      id: '1',
      companyName: 'ABC Teknoloji',
      type: 'Ar-Ge Teşviki',
      sector: 'Teknoloji',
      amount: 250000,
      status: 'pending_assignment',
      applicationDate: '2024-01-15T10:00:00Z',
      consultant: 'Atanmadı',
      companyId: '1',
      consultantId: null
    },
    {
      id: '2',
      companyName: 'XYZ İnşaat',
      type: 'Yatırım Teşviki',
      sector: 'İnşaat',
      amount: 500000,
      status: 'in_progress',
      applicationDate: '2024-01-10T09:00:00Z',
      consultant: 'Mehmet Demir',
      companyId: '3',
      consultantId: '2'
    },
    {
      id: '3',
      companyName: 'DEF Gıda',
      type: 'İstihdam Teşviki',
      sector: 'Gıda',
      amount: 150000,
      status: 'document_review',
      applicationDate: '2024-01-20T14:30:00Z',
      consultant: 'Mehmet Demir',
      companyId: '4',
      consultantId: '2'
    }
  ];
  
  res.json(mockApplications);
});

module.exports = router;