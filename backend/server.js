require('dotenv').config();
const express = require('express');
const cors = require('cors');
const path = require('path');
const fs = require('fs');
const connectDB = require('./config/db');

connectDB();

const app = express();

// Ensure uploads directory exists
if (!fs.existsSync('uploads')) fs.mkdirSync('uploads');

app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Routes
app.use('/api/auth', require('./routes/authRoutes'));
app.use('/api/content', require('./routes/contentRoutes'));
app.use('/api/topics', require('./routes/topicRoutes'));
app.use('/api/modules', require('./routes/moduleRoutes'));
app.use('/api/quizzes', require('./routes/quizRoutes'));
app.use('/api/results', require('./routes/resultRoutes'));
app.use('/api/admin', require('./routes/adminRoutes'));

// Global error handler
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(err.status || 500).json({ message: err.message || 'Server Error' });
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
