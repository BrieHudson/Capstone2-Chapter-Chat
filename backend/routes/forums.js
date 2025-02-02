const express = require('express');
const router = express.Router();
const { Forum, User, BookClub } = require('../models');
const { authenticate } = require('../middleware/authMiddleware');

// Get forum posts for a book club
router.get('/:clubId', authenticate, async (req, res) => {
  try {
    const posts = await Forum.findAll({
      where: {
        book_club_id: req.params.clubId  // Changed from club_id
      },
      include: [
        {
          model: User,
          as: 'user',
          attributes: ['id', 'username']
        }
      ],
      order: [['created_at', 'DESC']]
    });
    res.json(posts);
  } catch (error) {
    console.error("Error fetching forum posts:", error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Create a new forum post
router.post('/:clubId', authenticate, async (req, res) => {
  try {
    // First verify the book club exists and user is a member
    const bookClub = await BookClub.findByPk(req.params.clubId);
    if (!bookClub) {
      return res.status(404).json({ error: 'Book club not found' });
    }

    const isMember = await bookClub.hasMembers(req.user.id);
    if (!isMember) {
      return res.status(403).json({ error: 'Must be a member to post' });
    }

    const newPost = await Forum.create({
      book_club_id: req.params.clubId,  // Changed from club_id
      user_id: req.user.id,
      content: req.body.content,
      book_id: bookClub.current_book_id,
      contains_spoilers: req.body.contains_spoilers || false
    });

    // Fetch the created post with user details
    const post = await Forum.findByPk(newPost.id, {
      include: [
        {
          model: User,
          as: 'user',
          attributes: ['id', 'username']
        }
      ]
    });

    res.status(201).json(post);
  } catch (error) {
    console.error("Error creating forum post:", error);
    res.status(500).json({ 
      error: 'Internal server error',
      details: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
});

module.exports = router;
