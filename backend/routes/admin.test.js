const request = require('supertest');
const express = require('express');
const Admin = require('../controllers/admin');
const { authenticate, authorizeAdmin } = require('../middleware/auth');
const adminRoutes = require('../routes/admin');

// Mock authentication middleware
jest.mock('../middleware/auth', () => ({
  authenticate: (req, res, next) => {
    req.user = { id: 1, isAdmin: true };
    next();
  },
  authorizeAdmin: (req, res, next) => next()
}));

// Mock Admin controller
jest.mock('../controllers/admin', () => ({
  banUser: jest.fn(),
  deleteBookClub: jest.fn()
}));

const app = express();
app.use(express.json());
app.use('/admin', adminRoutes);

describe('Admin Routes', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('POST /admin/user/:id/ban', () => {
    it('should successfully ban a user', async () => {
      Admin.banUser.mockResolvedValue(true);

      const response = await request(app)
        .post('/admin/user/1/ban')
        .expect(200);

      expect(Admin.banUser).toHaveBeenCalledWith('1');
      expect(response.body).toHaveProperty('message', 'User successfully banned');
    });

    it('should return 404 if user not found', async () => {
      Admin.banUser.mockResolvedValue(false);

      const response = await request(app)
        .post('/admin/user/999/ban')
        .expect(404);

      expect(response.body).toHaveProperty('error', 'User not found');
    });

    it('should return 500 on server error', async () => {
      Admin.banUser.mockRejectedValue(new Error('Database error'));

      const response = await request(app)
        .post('/admin/user/1/ban')
        .expect(500);

      expect(response.body).toHaveProperty('error', 'Internal server error');
    });
  });

  describe('POST /admin/bookclub/:id/delete', () => {
    it('should successfully delete a book club', async () => {
      Admin.deleteBookClub.mockResolvedValue(true);

      const response = await request(app)
        .post('/admin/bookclub/1/delete')
        .expect(200);

      expect(Admin.deleteBookClub).toHaveBeenCalledWith('1');
      expect(response.body).toHaveProperty('message', 'Book club successfully deleted');
    });

    it('should return 404 if book club not found', async () => {
      Admin.deleteBookClub.mockResolvedValue(false);

      const response = await request(app)
        .post('/admin/bookclub/999/delete')
        .expect(404);

      expect(response.body).toHaveProperty('error', 'Book club not found');
    });

    it('should return 500 on server error', async () => {
      Admin.deleteBookClub.mockRejectedValue(new Error('Database error'));

      const response = await request(app)
        .post('/admin/bookclub/1/delete')
        .expect(500);

      expect(response.body).toHaveProperty('error', 'Internal server error');
    });
  });
});