const express = require('express');
const router = express.Router();
const { authenticate } = require('../middleware/authMiddleware');
const { sequelize } = require('../models');
const ReadingList = require('../models/readingList')(sequelize);
ReadingList.associate(sequelize.models);

const VALID_STATUSES = ['want_to_read', 'reading', 'read'];

// Route to get all reading lists grouped by status for a user
router.get('/', authenticate, async (req, res) => {
  try {
    const userId = req.user.id;
    const readingLists = await ReadingList.getAllByUserGrouped(userId);
    res.json(readingLists); // No transformation needed
  } catch (error) {
    console.error('Error fetching reading lists:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Route to add a new book to a specific list
router.post('/add', authenticate, async (req, res) => {
  const userId = req.user.id;
  const { book, list } = req.body;

  try {
    if (!VALID_STATUSES.includes(list)) {
      return res.status(400).json({ 
        error: 'Invalid list type',
        message: `List must be one of: ${VALID_STATUSES.join(', ')}`
      });
    }

    const addedBook = await ReadingList.addBook(userId, book, list);
    res.json({ success: true, book: addedBook });
  } catch (error) {
    console.error("Error adding book:", error);
    res.status(500).json({ 
      success: false,
      error: "Internal server error", 
      details: error.message 
    });
  }
});

// Route for moving books between lists
router.put('/move', authenticate, async (req, res) => {
  const userId = req.user.id;
  const { bookId, fromList, toList } = req.body;
  
  try {
    if (!bookId) {
      return res.status(400).json({
        success: false,
        error: 'Missing bookId'
      });
    }

    if (!VALID_STATUSES.includes(fromList)) {
      return res.status(400).json({
        success: false,
        error: `Invalid fromList status. Must be one of: ${VALID_STATUSES.join(', ')}`
      });
    }

    if (!VALID_STATUSES.includes(toList)) {
      return res.status(400).json({
        success: false,
        error: `Invalid toList status. Must be one of: ${VALID_STATUSES.join(', ')}`
      });
    }

    const result = await ReadingList.moveBook(userId, bookId, fromList, toList);
    res.json({ success: true, result });
  } catch (error) {
    console.error("Error moving book:", error);
    res.status(500).json({ 
      success: false,
      error: "Internal server error",
      details: error.message 
    });
  }
});

// Route for deleting a book from reading list
router.delete('/:bookId', authenticate, async (req, res) => {
  const userId = req.user.id;
  const { bookId } = req.params;
  
  try {
    await ReadingList.deleteBook(userId, bookId);
    res.json({ success: true, message: 'Book removed successfully' });
  } catch (error) {
    console.error("Error deleting book:", error);
    res.status(500).json({ 
      success: false,
      error: "Internal server error", 
      details: error.message 
    });
  }
});

module.exports = router;



