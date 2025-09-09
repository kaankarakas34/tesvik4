const express = require('express');
const router = express.Router();
const TicketController = require('../controllers/ticketController');
const { authenticateToken } = require('../middleware/auth');

// Tüm route'lar için authentication gerekli
router.use(authenticateToken);

// Ticket oluştur (sadece danışmanlar)
router.post('/', TicketController.createTicket);

// Tüm ticketları getir (sadece admin)
router.get('/all', TicketController.getAllTickets);

// Kullanıcının ticketlarını getir
router.get('/my-tickets', TicketController.getUserTickets);

// Ticket detayını getir
router.get('/:id', TicketController.getTicketById);

// Ticket'a mesaj ekle
router.post('/:id/messages', TicketController.addMessage);

// Ticket durumunu güncelle (sadece admin)
router.patch('/:id/status', TicketController.updateTicketStatus);

module.exports = router;