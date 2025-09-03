const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');
require('dotenv').config();

const { sequelize } = require('./src/models');
const authRoutes = require('./src/routes/auth');
const adminRoutes = require('./src/routes/admin');
const applicationsRoutes = require('./src/routes/applications');
const usersRoutes = require('./src/routes/users');
const incentivesRoutes = require('./src/routes/incentives');

const app = express();
const PORT = process.env.PORT || 5000;

// Security middleware
app.use(helmet());
app.use(cors({
  origin: process.env.NODE_ENV === 'production' 
    ? ['https://your-production-domain.com'] 
    : ['http://localhost:3000', 'http://192.168.1.123:3000', 'http://127.0.0.1:3000'],
  credentials: true
}));

// Middleware
app.use(morgan('combined'));
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/admin', adminRoutes);
app.use('/api/applications', applicationsRoutes);
app.use('/api/users', usersRoutes);
app.use('/api/incentives', incentivesRoutes);

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

    // Sync database models
    if (process.env.NODE_ENV === 'development') {
      await sequelize.sync({ force: false });
      console.log('✅ Database models synchronized.');
    }

    app.listen(PORT, process.env.HOST || '0.0.0.0', () => {
      console.log(`🚀 Server is running on port ${PORT}`);
      console.log(`📚 API Health: http://${process.env.HOST || 'localhost'}:${PORT}/api/health`);
      console.log(`🌍 Environment: ${process.env.NODE_ENV}`);
    });

  } catch (error) {
    console.error('❌ Unable to start server:', error);
    process.exit(1);
  }
}

startServer();

module.exports = app;