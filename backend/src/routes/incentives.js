const express = require('express');
const { authenticateToken } = require('../middleware/auth');

const router = express.Router();

// Get all active incentives
router.get('/', authenticateToken, (req, res) => {
  res.json({ message: 'Incentives endpoint - coming soon' });
});

module.exports = router;