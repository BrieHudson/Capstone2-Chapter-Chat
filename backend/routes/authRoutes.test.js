const request = require('supertest');
const express = require('express');
const bcrypt = require('bcryptjs');
const { User } = require('../models');
const authRoutes = require('../routes/authRoutes');

// Mock the entire models module
jest.mock('../models', () => ({
  Sequelize: {
    Op: {
      or: Symbol('or')
    }
  },
  User: {
    findOne: jest.fn(),
    create: jest.fn()
  }
}));

// Mock bcryptjs
jest.mock('bcryptjs', () => ({
  hash: jest.fn(),
  compare: jest.fn()
}));

const app = express();
app.use(express.json());
app.use('/auth', authRoutes);

describe('Auth Routes', () => {
  beforeEach(() => {
    // Clear all mocks before each test
    jest.clearAllMocks();
  });

  describe('POST /auth/signup', () => {
    const signupData = {
      username: 'testuser',
      email: 'test@example.com',
      password: 'password123'
    };

    it('should create a new user successfully', async () => {
      // Mock user doesn't exist
      User.findOne.mockResolvedValue(null);
      
      // Mock password hashing
      bcrypt.hash.mockResolvedValue('hashedPassword');
      
      // Mock user creation
      User.create.mockResolvedValue({
        id: 1,
        ...signupData,
        password: 'hashedPassword'
      });

      const response = await request(app)
        .post('/auth/signup')
        .send(signupData)
        .expect(201);

      expect(response.body).toHaveProperty('message', 'User created successfully');
      expect(response.body.user).toHaveProperty('id');
      expect(response.body.user).toHaveProperty('username', signupData.username);
      expect(response.body.user).toHaveProperty('email', signupData.email);
      expect(response.body.user).not.toHaveProperty('password');
    });

    it('should return 400 if username/email already exists', async () => {
      // Mock user exists
      User.findOne.mockResolvedValue({ id: 1, ...signupData });

      const response = await request(app)
        .post('/auth/signup')
        .send(signupData)
        .expect(400);

      expect(response.body).toHaveProperty('error', 'Username or email already taken');
    });

    it('should return 500 on server error', async () => {
      User.findOne.mockRejectedValue(new Error('Database error'));

      const response = await request(app)
        .post('/auth/signup')
        .send(signupData)
        .expect(500);

      expect(response.body).toHaveProperty('error', 'Server error');
    });
  });

  describe('POST /auth/login', () => {
    const loginData = {
      username: 'testuser',
      password: 'password123'
    };

    it('should login user successfully', async () => {
      // Mock user exists
      User.findOne.mockResolvedValue({
        id: 1,
        username: loginData.username,
        password: 'hashedPassword'
      });

      // Mock password comparison
      bcrypt.compare.mockResolvedValue(true);

      const response = await request(app)
        .post('/auth/login')
        .send(loginData)
        .expect(200);

      expect(response.body).toHaveProperty('token');
      expect(response.body).toHaveProperty('message', 'Logged in successfully');
    });

    it('should return 400 if user not found', async () => {
      User.findOne.mockResolvedValue(null);

      const response = await request(app)
        .post('/auth/login')
        .send(loginData)
        .expect(400);

      expect(response.body).toHaveProperty('error', 'Invalid username or password');
    });

    it('should return 400 if password is incorrect', async () => {
      User.findOne.mockResolvedValue({
        id: 1,
        username: loginData.username,
        password: 'hashedPassword'
      });

      bcrypt.compare.mockResolvedValue(false);

      const response = await request(app)
        .post('/auth/login')
        .send(loginData)
        .expect(400);

      expect(response.body).toHaveProperty('error', 'Invalid username or password');
    });

    it('should return 500 on server error', async () => {
      User.findOne.mockRejectedValue(new Error('Database error'));

      const response = await request(app)
        .post('/auth/login')
        .send(loginData)
        .expect(500);

      expect(response.body).toHaveProperty('error', 'Server error');
    });
  });
});
