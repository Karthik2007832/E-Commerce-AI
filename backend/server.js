const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const morgan = require('morgan');
require('dotenv').config();

const app = express();

// Global Middleware
app.use(express.json());
app.use(cors());
app.use(morgan('dev'));

// MongoDB Atlas Connection (Placeholder)
const mongoUri = process.env.MONGO_URI || 'mongodb://localhost:27017/ecommerce-ai';
let dbStatus = 'disconnected';

mongoose.connect(mongoUri)
  .then(() => {
    console.log('✅ Connected to MongoDB Atlas');
    dbStatus = 'connected';
    
    // Start listener only after successful connection
    const PORT = process.env.PORT || 5000;
    app.listen(PORT, () => {
      console.log(`🚀 Backend Server running on port ${PORT} (Connected Mode)`);
    });
  })
  .catch((err) => {
    console.error('❌ MongoDB Connection Error. Starting with Mock Data Fallback.');
    dbStatus = 'mock';
    
    const PORT = process.env.PORT || 5000;
    app.listen(PORT, () => {
      console.log(`🚀 Backend Server running on port ${PORT} (Mock Mode)`);
    });
  });

// Global state middleware
app.use((req, res, next) => {
  req.dbStatus = dbStatus;
  next();
});

// Route Handlers (Placeholders)
app.use('/api/auth', require('./routes/authRoutes'));
app.use('/api/products', require('./routes/productRoutes'));
app.use('/api/interactions', require('./routes/interactionRoutes'));
app.use('/api/orders', require('./routes/orderRoutes'));
app.use('/api/recommendations', require('./routes/recommendationRoutes'));
