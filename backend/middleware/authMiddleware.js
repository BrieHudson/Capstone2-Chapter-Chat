const jwt = require('jsonwebtoken');
const { User } = require('../models');

const authenticate = async (req, res, next) => {
  const token = req.headers.authorization?.split(' ')[1];

  if (!token) {
    return res.status(401).json({ 
      error: 'Please log in to continue',
      code: 'TOKEN_REQUIRED'
    });
  }

  try {
    const decoded = jwt.verify(token, process.env.SECRET_KEY);
    const user = await User.findByPk(decoded.id);

    if (!user) {
      return res.status(401).json({ 
        error: 'User account not found',
        code: 'USER_NOT_FOUND'
      });
    }

    // Check if token version matches
    if (decoded.tokenVersion !== user.tokenVersion) {
      return res.status(401).json({ 
        error: 'Your session has expired. Please log in again.',
        code: 'TOKEN_INVALIDATED'
      });
    }

    req.user = user;
    next();
  } catch (error) {
    if (error instanceof jwt.TokenExpiredError) {
      return res.status(401).json({ 
        error: 'Your session has expired. Please log in again.',
        code: 'TOKEN_EXPIRED'
      });
    }
    res.status(401).json({ 
      error: 'Please log in again to continue.',
      code: 'AUTH_FAILED'
    });
  }
};

module.exports = { authenticate };

