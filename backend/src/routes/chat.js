const express = require('express');
const { authenticateToken } = require('../middleware/auth');
const {
  getChatByApplication,
  getMessages,
  sendMessage,
  getUserChats,
  markMessagesAsRead,
  getUnreadCount,
  getCompanyChats,
  getApplicationDocuments
} = require('../controllers/chatController');

const router = express.Router();

// Get chat by application ID
router.get('/application/:applicationId', authenticateToken, getChatByApplication);

// Get messages for a chat
router.get('/messages/:chatId', authenticateToken, getMessages);

// Get user's chats
router.get('/conversations', authenticateToken, getUserChats);

// Get company chats (for company members)
router.get('/company', authenticateToken, getCompanyChats);

// Get unread message count
router.get('/unread-count', authenticateToken, getUnreadCount);

// Send a message (REST endpoint as backup)
router.post('/messages/:chatId', authenticateToken, sendMessage);

// Mark messages as read
router.patch('/messages/:chatId/read', authenticateToken, markMessagesAsRead);

// Get documents for application
router.get('/application/:applicationId/documents', authenticateToken, getApplicationDocuments);

module.exports = router;