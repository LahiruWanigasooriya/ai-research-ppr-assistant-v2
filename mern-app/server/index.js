const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const dotenv = require('dotenv');

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(cors());
app.use(express.json());

// Routes
const aiRoutes = require('./routes/ai');
app.use('/api', aiRoutes);

// Root health-check route
app.get('/', (req, res) => {
  res.json({
    message: 'Research Paper Assistant API is running.',
    endpoints: [
      'POST /api/upload',
      'POST /api/chat',
      'POST /api/summarize',
      'POST /api/keypoints',
      'GET  /api/history/:sessionId',
    ],
  });
});

// Connect to MongoDB then start server
mongoose
  .connect(process.env.MONGODB_URI)
  .then(() => {
    console.log('✅ Connected to MongoDB');
    app.listen(PORT, () => {
      console.log(`🚀 Server running on port ${PORT}`);
    });
  })
  .catch((err) => {
    console.error('❌ MongoDB connection error:', err.message);
    process.exit(1);
  });
