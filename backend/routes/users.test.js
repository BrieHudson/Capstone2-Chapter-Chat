const request = require('supertest');
const express = require('express');
const User = require('../models/user');
const userRoutes = require('../routes/users');

// Mock authentication middleware
jest.mock('../middleware/authMiddleware', () => ({
  authenticate: (req, res, next) => {
    req.user = { id: 1 };
    next();
  },
  authorizeAdmin: (req, res, next) => next()
}));

// Mock User model
jest.mock('../models/user', () => ({
  getById: jest.fn(),
  create: jest.fn(),
  update: jest.fn(),
  delete: jest.fn(),
  login: jest.fn(),
  logout: jest.fn()
}));

const app = express();
app.use(express.json());
app.use('/users', userRoutes);

describe('Users Routes', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('GET /users/:id', () => {
    const mockUser = {
      id: 1,
      username: 'testuser',
      email: 'test@example.com'
    };

    it('should successfully get user by ID', async () => {
      User.getById.mockResolvedValue(mockUser);

      const response = await request(app)
        .get('/users/1')
        .expect(200);

      expect(response.body).toEqual(mockUser);
      expect(User.getById).toHaveBeenCalledWith('1');
    });

    it('should return 404 if user not found', async () => {
      User.getById.mockResolvedValue(null);

      const response = await request(app)
        .get('/users/999')
        .expect(404);

      expect(response.body).toHaveProperty('error', 'User not found');
    });

    it('should return 500 on server error', async () => {
      User.getById.mockRejectedValue(new Error('Database error'));

      const response = await request(app)
        .get('/users/1')
        .expect(500);

      expect(response.body).toHaveProperty('error', 'Internal server error');
    });
  });

  describe('POST /users', () => {
    const mockUserData = {
      username: 'newuser',
      email: 'new@example.com'
    };

    it('should successfully create a new user', async () => {
      User.create.mockResolvedValue({ id: 1, ...mockUserData });

      const response = await request(app)
        .post('/users')
        .send(mockUserData)
        .expect(201);

      expect(response.body).toEqual({ id: 1, ...mockUserData });
      expect(User.create).toHaveBeenCalledWith(mockUserData);
    });

    it('should return 400 if required fields are missing', async () => {
      const response = await request(app)
        .post('/users')
        .send({ username: 'newuser' })
        .expect(400);

      expect(response.body).toHaveProperty('error', 'Username and email are required');
    });

    it('should return 500 on server error', async () => {
      User.create.mockRejectedValue(new Error('Database error'));

      const response = await request(app)
        .post('/users')
        .send(mockUserData)
        .expect(500);

      expect(response.body).toHaveProperty('error', 'Internal server error');
    });
  });

  describe('PUT /users/:id', () => {
    const mockUpdateData = {
      username: 'updateduser',
      email: 'updated@example.com'
    };

    it('should successfully update user details', async () => {
      User.update.mockResolvedValue({ id: 1, ...mockUpdateData });

      const response = await request(app)
        .put('/users/1')
        .send(mockUpdateData)
        .expect(200);

      expect(response.body).toEqual({ id: 1, ...mockUpdateData });
      expect(User.update).toHaveBeenCalledWith('1', mockUpdateData);
    });

    it('should return 400 if required fields are missing', async () => {
      const response = await request(app)
        .put('/users/1')
        .send({ username: 'updateduser' })
        .expect(400);

      expect(response.body).toHaveProperty('error', 'Username and email are required');
    });

    it('should return 404 if user not found', async () => {
      User.update.mockResolvedValue(null);

      const response = await request(app)
        .put('/users/999')
        .send(mockUpdateData)
        .expect(404);

      expect(response.body).toHaveProperty('error', 'User not found');
    });
  });

  describe('DELETE /users/:id', () => {
    it('should successfully delete a user', async () => {
      User.delete.mockResolvedValue(true);

      const response = await request(app)
        .delete('/users/1')
        .expect(200);

      expect(response.body).toHaveProperty('message', 'User successfully deleted');
      expect(User.delete).toHaveBeenCalledWith('1');
    });

    it('should return 404 if user not found', async () => {
      User.delete.mockResolvedValue(false);

      const response = await request(app)
        .delete('/users/999')
        .expect(404);

      expect(response.body).toHaveProperty('error', 'User not found');
    });
  });

  describe('POST /users/auth/login', () => {
    const loginCredentials = {
      email: 'test@example.com',
      password: 'password123'
    };

    it('should successfully login user', async () => {
      User.login.mockResolvedValue('mockToken123');

      const response = await request(app)
        .post('/users/auth/login')
        .send(loginCredentials)
        .expect(200);

      expect(response.body).toHaveProperty('token', 'mockToken123');
      expect(User.login).toHaveBeenCalledWith(
        loginCredentials.email,
        loginCredentials.password
      );
    });

    it('should return 400 if credentials are missing', async () => {
      const response = await request(app)
        .post('/users/auth/login')
        .send({ email: 'test@example.com' })
        .expect(400);

      expect(response.body).toHaveProperty('error', 'Email and password are required');
    });

    it('should return 401 if credentials are invalid', async () => {
      User.login.mockResolvedValue(null);

      const response = await request(app)
        .post('/users/auth/login')
        .send(loginCredentials)
        .expect(401);

      expect(response.body).toHaveProperty('error', 'Invalid credentials');
    });
  });

  describe('POST /users/auth/logout', () => {
    it('should successfully logout user', async () => {
      User.logout.mockResolvedValue(true);

      const response = await request(app)
        .post('/users/auth/logout')
        .expect(200);

      expect(response.body).toHaveProperty('message', 'Successfully logged out');
      expect(User.logout).toHaveBeenCalledWith(1);
    });

    it('should return 500 on server error', async () => {
      User.logout.mockRejectedValue(new Error('Database error'));

      const response = await request(app)
        .post('/users/auth/logout')
        .expect(500);

      expect(response.body).toHaveProperty('error', 'Internal server error');
    });
  });
});
