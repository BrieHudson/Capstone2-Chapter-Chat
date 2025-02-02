const request = require('supertest');
const express = require('express');
const app = require('../app'); 
const User = require('../models/user');
const usersRoutes = require('../routes/users');  

// Use express middleware to parse JSON
app.use(express.json());
app.use('/api/users', usersRoutes);

jest.mock('../models/user'); // Mock the User model

describe('Users API Routes', () => {

  // Test for GET /api/users/:id
  it('should return user data for a valid ID', async () => {
    const mockUser = { id: 1, username: 'testUser', email: 'test@example.com' };
    User.getById.mockResolvedValue(mockUser);  // Mock the resolved value

    const response = await request(app).get('/api/users/1');
    expect(response.status).toBe(200);
    expect(response.body).toEqual(mockUser);
  });

  it('should return 404 if user not found', async () => {
    User.getById.mockResolvedValue(null);  // Mock that the user is not found

    const response = await request(app).get('/api/users/999');
    expect(response.status).toBe(404);
    expect(response.body).toHaveProperty('error', 'User not found');
  });

  // Test for POST /api/users
  it('should create a new user and return the created user data', async () => {
    const newUser = { username: 'newUser', email: 'new@example.com' };
    const createdUser = { id: 2, ...newUser };

    User.create.mockResolvedValue(createdUser);  // Mock the created user response

    const response = await request(app)
      .post('/api/users')
      .send(newUser);

    expect(response.status).toBe(201);
    expect(response.body).toEqual(createdUser);
  });

  it('should return 500 if there is an internal server error', async () => {
    User.create.mockRejectedValue(new Error('Internal error'));  // Simulate an error

    const newUser = { username: 'errorUser', email: 'error@example.com' };

    const response = await request(app)
      .post('/api/users')
      .send(newUser);

    expect(response.status).toBe(500);
    expect(response.body).toHaveProperty('error', 'Internal server error');
  });
});
