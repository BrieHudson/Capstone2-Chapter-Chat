const express = require('express');
const router = express.Router();
const { User, Book, BookClub, Forum, sequelize } = require('../models');
const { Sequelize } = require('sequelize');
const { authenticate } = require('../middleware/authMiddleware');

router.use((req, res, next) => {
  console.log('BookClub Router - Incoming request:', {
    method: req.method,
    path: req.path,
    query: req.query,
    params: req.params
  });
  next();
});

// Search book clubs
router.get('/search', authenticate, async (req, res) => {
  console.log('Search endpoint hit:', req.query);
  const { query } = req.query;
  
  if (!query) {
    return res.status(400).json({ error: 'Search query is required' });
  }
  
  try {
    console.log('Executing Searching for:', query);

    const bookClubs = await BookClub.findAll({
      where: {
        [Sequelize.Op.or]: [
          { name: { [Sequelize.Op.iLike]: `%${query}%` } },
          { description: { [Sequelize.Op.iLike]: `%${query}%` } }
        ]
      },
      include: [
        { model: User, as: 'creator', attributes: ['id', 'username'] },
        { model: Book, as: 'currentBook', attributes: ['id', 'title'] }
      ]
    });
    console.log('Found book clubs:', bookClubs.length);
    res.json(bookClubs);
  } catch (error) {
    console.error('Search error details:', error);
    res.status(500).json({ 
      error: 'Failed to search book clubs',
      details: error.message 
    });
  }
});


// Get all book clubs for a user
router.get('/', authenticate, async (req, res) => {
  try {
    const bookClubs = await BookClub.getAllForUser(req.user.id);
    res.json(bookClubs);
  } catch (error) {
    console.error('Error fetching user book clubs:', error);
    res.status(500).json({ error: 'Failed to fetch book clubs' });
  }
});


// Get a single book club's details 
router.get('/:id', authenticate, async (req, res) => {
  try {
    const bookClub = await BookClub.findByPk(req.params.id, {
      include: [
        { 
          model: User, 
          as: 'creator', 
          attributes: ['id', 'username'] 
        },
        { 
          model: Book, 
          as: 'currentBook',
          attributes: [
            'id', 
            'title', 
            'author', 
            'google_books_id',
            ['thumbnail_url', 'image_url'],
            'description'
          ]
        },
        {
          model: Forum,
          as: 'forumPosts',
          include: [
            {
              model: User,
              as: 'user',
              attributes: ['id', 'username']
            }
          ],
          order: [['created_at', 'DESC']]
        }
      ]
    });

    if (!bookClub) {
      return res.status(404).json({ error: 'Book club not found' });
    }

    // Check if user is a member
    const isMember = await bookClub.hasMembers(req.user.id);
    const responseData = bookClub.toJSON();
    responseData.isMember = isMember;

    res.json(responseData);
  } catch (error) {
    console.error('Error fetching book club details:', error);
    res.status(500).json({ error: 'Failed to fetch book club details' });
  }
});


// Create a new book club
router.post('/', authenticate, async (req, res) => {
  console.log("Create Book Club - Request Body:", req.body);
  const { 
    name, 
    description, 
    image_url, 
    book_id, 
    meeting_time, 
    title, 
    author, 
    isbn,
    thumbnail_url = image_url
  } = req.body;

  // Validate required fields
  if (!name || !description || !book_id || !meeting_time) {
    return res.status(400).json({ 
      error: 'Required fields missing',
      missing: {
        name: !name,
        description: !description,
        book_id: !book_id,
        meeting_time: !meeting_time
      }
    });
  }

  try {
    // Start a transaction
    const result = await sequelize.transaction(async (t) => {
      // Check if the book exists by Google Books ID
      let book = await Book.findOne({ 
        where: { google_books_id: book_id },
        transaction: t
      });

      // If the book doesn't exist, create it
      if (!book) {
        console.log("Creating new book:", { title, author, google_books_id: book_id });
        book = await Book.create({
          google_books_id: book_id,
          title: title || 'Unknown Title',
          author: author || 'Unknown Author',
          isbn: isbn || null,
          thumbnail_url: thumbnail_url || null
        }, { transaction: t });
      }

      console.log("Creating book club with book:", book.id);

      // Create the book club
      const bookClub = await BookClub.create({
        name,
        description,
        image_url,
        book_id: book.id,         
        current_book_id: book.id, 
        meeting_time,
        creator_id: req.user.id,
      }, { transaction: t });

      // Add the creator as a member
      await bookClub.addMember(req.user.id, { transaction: t });

      return bookClub;
    });

    // Send back the created book club with additional details
    const bookClubWithDetails = await BookClub.findByPk(result.id, {
      include: [
        { model: User, as: 'creator', attributes: ['id', 'username'] },
        { model: Book, as: 'currentBook', attributes: ['id', 'title', 'author', 'google_books_id', ['thumbnail_url', 'image_url']] },
      ]
    });

    res.status(201).json(bookClubWithDetails);

  } catch (error) {
    console.error('Error creating book club:', error);
    res.status(500).json({ 
      error: 'Failed to create book club',
      details: error.message,
      stack: process.env.NODE_ENV === 'development' ? error.stack : undefined
    });
  }
});


// Update the current book
router.put('/:id', authenticate, async (req, res) => {
  const { id } = req.params;
  const { name, description, image_url, book_id, meeting_time, title, author } = req.body;

  try {
    // First, check if this is a new book from Google Books API
    let currentBookId = null;
    if (book_id) {
      // Check if the book exists in our database
      let book = await Book.findOne({ 
        where: { google_books_id: book_id }
      });

      // If the book doesn't exist, create it
      if (!book) {
        book = await Book.create({
          google_books_id: book_id,
          title: title,
          author: author,
          image_url: req.body.book_image_url
        });
      }
      currentBookId = book.id;
    }

    const updateData = {
      ...(name && { name }),
      ...(description && { description }),
      ...(image_url && { image_url }),
      ...(meeting_time && { meeting_time }),
      ...(currentBookId && { current_book_id: currentBookId })
    };

    const updatedClub = await BookClub.updateClubDetails(id, req.user.id, updateData);

    // Fetch updated club details with associations
    const clubWithDetails = await BookClub.findByPk(id, {
      include: [
        { 
          model: User, 
          as: 'creator', 
          attributes: ['id', 'username'] 
        },
        { 
          model: Book, 
          as: 'currentBook',
          attributes: ['id', 'title', 'author', 'google_books_id', 'image_url'] 
        }
      ]
    });

    res.json(clubWithDetails);
  } catch (error) {
    console.error('Error updating book club:', error);
    if (error.message === 'Unauthorized') {
      res.status(403).json({ error: 'Not authorized to update this book club' });
    } else {
      res.status(500).json({ error: 'Failed to update book club' });
    }
  }
});


// Join a book club
router.post('/:id/join', authenticate, async (req, res) => {
  const { id: bookClubId } = req.params;

  try {
    const bookClub = await BookClub.findByPk(bookClubId);
    if (!bookClub) {
      return res.status(404).json({ error: 'Book club not found' });
    }

    await bookClub.addMember(req.user.id);
    res.json({ message: 'Successfully joined the book club' });
  } catch (error) {
    console.error("Error joining book club:", error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

module.exports = router;

