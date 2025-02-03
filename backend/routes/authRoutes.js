const express = require('express');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { Sequelize, User } = require('../models');  
const authMiddleware = require('../middleware/authMiddleware');
const router = express.Router();
const SECRET_KEY = process.env.SECRET_KEY;

// Sign Up Route
router.post('/signup', async (req, res) => {
  const { username, email, password } = req.body;
  
  try {
    // Check if user exists using Sequelize
    const userExists = await User.findOne({
      where: {
        [Sequelize.Op.or]: [
          { username: username },
          { email: email }
        ]
      }
    });

    if (userExists) {
      return res.status(400).json({ error: 'Username or email already taken' });
    }

    // Create new user using Sequelize
    const hashedPassword = await bcrypt.hash(password, 10);
    const newUser = await User.create({
      username,
      email,
      password: hashedPassword
    });

    res.status(201).json({
      message: 'User created successfully',
      user: {
        id: newUser.id,
        username: newUser.username,
        email: newUser.email
      }
    });

  } catch (err) {
    console.error('Signup error:', err);
    res.status(500).json({ error: 'Server error' });
  }
});

// login route
router.post('/login', async (req, res) => {
  const { username, password } = req.body;
  
  try {
    const user = await User.findOne({
      where: { username }
    });

    if (!user) {
      return res.status(400).json({ error: 'Invalid username or password' });
    }

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(400).json({ error: 'Invalid username or password' });
    }

    const token = jwt.sign({ id: user.id }, SECRET_KEY, { expiresIn: '1h' });
    res.json({ token, message: 'Logged in successfully' });
    
  } catch (err) {
    console.error('Login error:', err);
    res.status(500).json({ error: 'Server error' });
  }
});

module.exports = router;



