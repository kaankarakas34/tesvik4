console.log('🚀 SERVER.JS STARTING...');
const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');
const http = require('http');
const { Server } = require('socket.io');
require('dotenv').config();

const { sequelize } = require('./src/models');
const authRoutes = require('./src/routes/auth');
const adminRoutes = require('./src/routes/admin');
console.log('Admin routes loaded:', typeof adminRoutes);
const applicationsRoutes = require('./src/routes/applications');
const usersRoutes = require('./src/routes/users');
const incentivesRoutes = require('./src/routes/incentiveRoutes');
const incentiveTypeRoutes = require('./src/routes/incentiveTypeRoutes');
const userRoutes = require('./src/routes/userRoutes');
const documentRoutes = require('./src/routes/documentRoutes');
const chatRoutes = require('./src/routes/chat');
const regulationsRoutes = require('./src/routes/regulations');
const ticketRoutes = require('./src/routes/ticketRoutes');
const sectorRoutes = require('./src/routes/sectorRoutes');
const SocketService = require('./src/services/socketService');

const app = express();

// Request logger - FIRST MIDDLEWARE
const fs = require('fs');
console.log('🔧 SETTING UP REQUEST LOGGER MIDDLEWARE...');
app.use((req, res, next) => {
  console.log('🔥🔥🔥 MIDDLEWARE HIT:', req.method, req.url);
  const logMessage = `${new Date().toISOString()} - ${req.method} ${req.url}\n`;
  console.log('🔥 REQUEST RECEIVED:', req.method, req.url);
  try {
    fs.appendFileSync('request.log', logMessage);
    console.log('📝 Log written to file');
  } catch (err) {
    console.error('❌ Log write error:', err);
  }
  next();
});
console.log('✅ REQUEST LOGGER MIDDLEWARE SET UP');

const server = http.createServer(app);
const PORT = process.env.PORT || 5000;

// Security middleware
app.use(helmet());
app.use(cors({
  origin: process.env.NODE_ENV === 'production' 
    ? ['https://your-production-domain.com'] 
    : ['http://localhost:3000', 'http://192.168.1.122:3000', 'http://127.0.0.1:3000'],
  credentials: true
}));

// Other middleware
app.use(morgan('combined'));
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Socket.IO setup
const io = new Server(server, {
  cors: {
    origin: process.env.FRONTEND_URL || "http://192.168.1.122:3000",
    methods: ["GET", "POST"]
  }
});

// Initialize Socket Service
const socketService = new SocketService(io);

// Routes
app.use('/api/auth', authRoutes);
console.log('Mounting admin routes at /api/admin');
console.log('Admin routes type:', typeof adminRoutes);
console.log('Admin routes keys:', Object.keys(adminRoutes));
app.use('/api/admin', adminRoutes);

// Debug route
app.get('/api/debug', (req, res) => {
  res.json({ message: 'Debug endpoint works!' });
});
app.use('/api/applications', applicationsRoutes);
app.use('/api/users', usersRoutes);
app.use('/api/incentives', incentivesRoutes);
app.use('/api/incentive-types', incentiveTypeRoutes);
app.use('/api/user', userRoutes);
app.use('/api/documents', documentRoutes);
app.use('/api/chat', chatRoutes);
app.use('/api/regulations', regulationsRoutes);
app.use('/api/tickets', ticketRoutes);
app.use('/api/sectors', sectorRoutes);

// Health check
app.get('/api/health', (req, res) => {
  res.json({ 
    status: 'OK', 
    timestamp: new Date().toISOString(),
    environment: process.env.NODE_ENV 
  });
});

// Error handling middleware
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ 
    message: 'Something went wrong!', 
    error: process.env.NODE_ENV === 'development' ? err.message : 'Internal Server Error' 
  });
});

// 404 handler
app.use('*', (req, res) => {
  res.status(404).json({ message: 'Endpoint not found' });
});

async function startServer() {
  try {
    // Test database connection
    await sequelize.authenticate();
    console.log('✅ Database connection established successfully.');

    // Database models are already created, skipping sync
    console.log('✅ Database models ready (sync disabled).');

    server.listen(PORT, process.env.HOST || '0.0.0.0', () => {
      console.log(`🚀 Server is running on port ${PORT}`);
      console.log(`📚 API Health: http://${process.env.HOST || 'localhost'}:${PORT}/api/health`);
      console.log(`🌍 Environment: ${process.env.NODE_ENV}`);
      console.log('🔌 Socket.IO server ready');
    });

  } catch (error) {
    console.error('❌ Unable to start server:', error);
    process.exit(1);
  }
}

startServer();

module.exports = app;