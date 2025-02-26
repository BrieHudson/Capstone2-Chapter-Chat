const express = require('express');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { Sequelize, User } = require('../models');  
const router = express.Router();
const SECRET_KEY = process.env.SECRET_KEY;

// Sign Up Route
router.post('/signup', async (req, res) => {
  const { username, email, password } = req.body;
  
  try {
    console.log('Starting signup process:', { username, email });

    const userExists = await User.findOne({
      where: {
        [Sequelize.Op.or]: [
          { username: username },
          { email: email }
        ]
      }
    });
    console.log("User exists check:", { exists: !!userExists });

    if (userExists) {
      return res.status(400).json({ 
        error: 'Username or email already taken',
        code: 'DUPLICATE_USER'
      });
    }

    console.log('Creating new user...');
    const hashedPassword = await bcrypt.hash(password, 10);
    const newUser = await User.create({
      username,
      email,
      password: hashedPassword,
      tokenVersion: 0
    });
    console.log("User created:", newUser.id);

    res.status(201).json({
      message: 'Account created successfully! Please log in.',
      user: {
        id: newUser.id,
        username: newUser.username,
        email: newUser.email
      }
    });

  } catch (err) {
    console.error('Detailed signup error:', {
      message: err.message,
      name: err.name,
      stack: err.stack,
      sequelizeError: err.original
    });
    res.status(500).json({ 
      error: 'Something went wrong. Please try again.',
      code: 'SERVER_ERROR'
    });
  }
});

// Login route
router.post('/login', async (req, res) => {
  const { username, password } = req.body;
  
  try {
    const user = await User.findOne({
      where: { username }
    });

    if (!user) {
      return res.status(400).json({ 
        error: 'Invalid username or password',
        code: 'INVALID_CREDENTIALS'
      });
    }

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(400).json({ 
        error: 'Invalid username or password',
        code: 'INVALID_CREDENTIALS'
      });
    }

    const token = jwt.sign(
      { 
        id: user.id,
        username: user.username,
        tokenVersion: user.tokenVersion
      }, 
      SECRET_KEY, 
      { expiresIn: '1h' }
    );

    const decodedToken = jwt.decode(token);
    
    res.json({ 
      token,
      expiresAt: decodedToken.exp * 1000,
      user: {
        id: user.id,
        username: user.username
      },
      message: 'Logged in successfully'
    });
    
  } catch (err) {
    console.error('Login error:', err);
    res.status(500).json({ 
      error: 'Something went wrong. Please try again.',
      code: 'SERVER_ERROR'
    });
  }
});

// Refresh token route
router.post('/refresh-token', async (req, res) => {
  const { token } = req.body;

  if (!token) {
    return res.status(400).json({ 
      error: 'No token provided',
      code: 'TOKEN_REQUIRED'
    });
  }

  try {
    const decoded = jwt.verify(token, SECRET_KEY, { ignoreExpiration: true });
    const user = await User.findByPk(decoded.id);

    if (!user) {
      return res.status(401).json({ 
        error: 'User not found',
        code: 'USER_NOT_FOUND'
      });
    }

    // Create new token
    const newToken = jwt.sign(
      { 
        id: user.id,
        username: user.username,
        tokenVersion: user.tokenVersion
      }, 
      SECRET_KEY, 
      { expiresIn: '1h' }
    );

    const decodedToken = jwt.decode(newToken);

    res.json({ 
      token: newToken,
      expiresAt: decodedToken.exp * 1000,
      message: 'Token refreshed successfully'
    });

  } catch (err) {
    res.status(401).json({ 
      error: 'Invalid token. Please log in again.',
      code: 'INVALID_TOKEN'
    });
  }
});

module.exports = router;



