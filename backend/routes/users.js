const express = require('express');
const User = require('../models/user');
const router = express.Router();
const { authenticate, authorizeAdmin } = require('../middleware/authMiddleware');

// Middleware: Validate user payload
const validateUserPayload = (req, res, next) => {
  const { username, email } = req.body;
  if (!username || !email) {
    return res.status(400).json({ error: "Username and email are required" });
  }
  next();
};

// Route: Get a user by ID
router.get('/:id', async (req, res) => {
  const { id } = req.params;

  try {
    const user = await User.getById(id);
    if (!user) return res.status(404).json({ error: 'User not found' });
    res.json(user);
  } catch (error) {
    console.error("Error fetching user by ID:", error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Route: Create a new user
router.post('/', validateUserPayload, async (req, res) => {
  try {
    const newUser = await User.create(req.body);
    res.status(201).json(newUser);
  } catch (error) {
    console.error("Error creating new user:", error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Route: Update user details
router.put('/:id', validateUserPayload, async (req, res) => {
  const { id } = req.params;

  try {
    const updatedUser = await User.update(id, req.body);
    if (!updatedUser) {
      return res.status(404).json({ error: 'User not found' });
    }
    res.json(updatedUser);
  } catch (error) {
    console.error("Error updating user:", error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Route: Delete a user
router.delete('/:id', async (req, res) => {
  const { id } = req.params;

  try {
    const deletedUser = await User.delete(id);
    if (!deletedUser) {
      return res.status(404).json({ error: 'User not found' });
    }
    res.json({ message: 'User successfully deleted' });
  } catch (error) {
    console.error("Error deleting user:", error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Route: User login
router.post('/auth/login', async (req, res) => {
  const { email, password } = req.body;

  if (!email || !password) {
    return res.status(400).json({ error: 'Email and password are required' });
  }

  try {
    const token = await User.login(email, password); // Login logic in User model
    if (!token) {
      return res.status(401).json({ error: 'Invalid credentials' });
    }
    res.json({ token });
  } catch (error) {
    console.error("Login error:", error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Route: User logout
router.post('/auth/logout', authenticate, async (req, res) => {
  try {
    await User.logout(req.user.id); // Logout logic in User model
    res.json({ message: 'Successfully logged out' });
  } catch (error) {
    console.error("Logout error:", error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

module.exports = router;

