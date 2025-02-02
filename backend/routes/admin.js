const express = require('express');
const Admin = require('../controllers/admin');
const { authenticate, authorizeAdmin } = require('../middleware/auth');
const router = express.Router();

// Route: Ban a user
router.post('/user/:id/ban', authenticate, authorizeAdmin, async (req, res) => {
  const { id: userId } = req.params;

  try {
    const result = await Admin.banUser(userId);
    if (!result) {
      return res.status(404).json({ error: 'User not found' });
    }
    res.json({ message: 'User successfully banned' });
  } catch (error) {
    console.error("Error banning user:", error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Route: Delete a book club
router.post('/bookclub/:id/delete', authenticate, authorizeAdmin, async (req, res) => {
  const { id: bookClubId } = req.params;

  try {
    const result = await Admin.deleteBookClub(bookClubId);
    if (!result) {
      return res.status(404).json({ error: 'Book club not found' });
    }
    res.json({ message: 'Book club successfully deleted' });
  } catch (error) {
    console.error("Error deleting book club:", error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

module.exports = router;

