const express = require('express');
const cors = require('cors');
require('dotenv').config(); 
const { sequelize } = require('./db');
const db = require('./models');

// Routers
const booksRouter = require('./routes/books');
const usersRouter = require('./routes/users');
const readingListRouter = require('./routes/readingList');
const authRoutes = require('./routes/authRoutes');
const bookClubRoutes = require('./routes/bookClub');
const forumRoutes = require('./routes/forums');

const app = express();

// Middleware
app.use(cors({ 
  origin: [
    'http://localhost:3000', 
    'https://chapter-chat-frontend.onrender.com' 
  ], 
  credentials: true 
}));
app.use(express.json()); // Parse JSON request bodies

// Routes
app.use('/api/books', booksRouter);
app.use('/api/users', usersRouter);
app.use('/api/readingList', readingListRouter);
app.use('/api/authRoutes', authRoutes);
app.use('/api/bookClubs', bookClubRoutes);
app.use('/api/forums', forumRoutes);

app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ 
    error: 'Internal server error',
    details: process.env.NODE_ENV === 'development' ? err.message : undefined
  });
});

// Start server and test database connection
(async () => {
  try {
    await sequelize.authenticate();
    console.log('Database connected successfully.');
    
    if (process.env.NODE_ENV === 'development') {
      await sequelize.sync(); 
    }
    
    console.log(`Server is running on http://localhost:${process.env.PORT || 5012}`);
  } catch (error) {
    console.error('Unable to connect to the database:', {
      message: error.message,
      name: error.name,
      code: error.original?.code,
      detail: error.original?.detail
    });
    process.exit(1);
  }
})();

module.exports = app; 


