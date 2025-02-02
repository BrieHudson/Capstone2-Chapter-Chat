const express = require('express');
const cors = require('cors');
require('dotenv').config(); 
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
app.use(cors({ origin: 'http://localhost:3000', credentials: true })); // Enable CORS
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
    // Test database connection
    await db.sequelize.authenticate();
    console.log('Database connected successfully.');

    // Optionally sync the database (during development only)
    await db.sequelize.sync(); // Use { alter: true } or { force: true } if needed

    // Since the port is defined in server.js, no need to configure it here
    console.log(`Server is running on http://localhost:5012`);
  } catch (error) {
    console.error('Unable to connect to the database:', error);
    process.exit(1); // Exit process with failure code
  }
})();

module.exports = app; // Export the app for server.js to use


