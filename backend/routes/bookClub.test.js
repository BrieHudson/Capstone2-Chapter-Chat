const request = require('supertest');
const express = require('express');
const { User, Book, BookClub, Forum, sequelize } = require('../models');
const { authenticate } = require('../middleware/authMiddleware');
const bookClubRoutes = require('../routes/bookClub');

// Mock authentication middleware
jest.mock('../middleware/authMiddleware', () => ({
  authenticate: (req, res, next) => {
    req.user = { id: 1 };
    next();
  }
}));

// Mock models
jest.mock('../models', () => ({
  User: {
    findByPk: jest.fn()
  },
  Book: {
    findOne: jest.fn(),
    create: jest.fn()
  },
  BookClub: {
    findAll: jest.fn(),
    findByPk: jest.fn(),
    create: jest.fn(),
    getAllForUser: jest.fn(),
    updateClubDetails: jest.fn()
  },
  Forum: {
    findAll: jest.fn()
  },
  sequelize: {
    transaction: jest.fn(callback => callback())
  },
  Sequelize: {
    Op: {
      or: Symbol('or'),
      iLike: Symbol('iLike')
    }
  }
}));

const app = express();
app.use(express.json());
app.use('/bookclub', bookClubRoutes);

describe('Book Club Routes', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('GET /bookclub/search', () => {
    it('should search book clubs successfully', async () => {
      const mockClubs = [
        {
          id: 1,
          name: 'Test Club',
          description: 'Test Description',
          creator: { id: 1, username: 'testuser' },
          currentBook: { id: 1, title: 'Test Book' }
        }
      ];

      BookClub.findAll.mockResolvedValue(mockClubs);

      const response = await request(app)
        .get('/bookclub/search')
        .query({ query: 'test' })
        .expect(200);

      expect(response.body).toEqual(mockClubs);
    });

    it('should return 400 if search query is missing', async () => {
      const response = await request(app)
        .get('/bookclub/search')
        .expect(400);

      expect(response.body).toHaveProperty('error', 'Search query is required');
    });
  });

  describe('GET /bookclub', () => {
    it('should get all book clubs for user', async () => {
      const mockClubs = [
        { id: 1, name: 'Club 1' },
        { id: 2, name: 'Club 2' }
      ];

      BookClub.getAllForUser.mockResolvedValue(mockClubs);

      const response = await request(app)
        .get('/bookclub')
        .expect(200);

      expect(response.body).toEqual(mockClubs);
    });
  });

  describe('GET /bookclub/:id', () => {
    it('should get book club details successfully', async () => {
      const mockClub = {
        id: 1,
        name: 'Test Club',
        toJSON: () => ({
          id: 1,
          name: 'Test Club'
        }),
        hasMembers: jest.fn().mockResolvedValue(true)
      };

      BookClub.findByPk.mockResolvedValue(mockClub);

      const response = await request(app)
        .get('/bookclub/1')
        .expect(200);

      expect(response.body).toHaveProperty('id', 1);
      expect(response.body).toHaveProperty('isMember', true);
    });

    it('should return 404 if book club not found', async () => {
      BookClub.findByPk.mockResolvedValue(null);

      const response = await request(app)
        .get('/bookclub/999')
        .expect(404);

      expect(response.body).toHaveProperty('error', 'Book club not found');
    });
  });

  describe('POST /bookclub', () => {
    const newClubData = {
      name: 'New Club',
      description: 'New Description',
      book_id: 'book1',
      meeting_time: '2024-02-02T10:00:00Z',
      title: 'Test Book',
      author: 'Test Author'
    };

    it('should create a new book club successfully', async () => {
      const mockBook = {
        id: 1,
        title: 'Test Book'
      };

      Book.findOne.mockResolvedValue(null);
      Book.create.mockResolvedValue(mockBook);
      
      const mockClub = {
        id: 1,
        ...newClubData,
        addMember: jest.fn().mockResolvedValue(true)
      };

      BookClub.create.mockResolvedValue(mockClub);
      BookClub.findByPk.mockResolvedValue({
        ...mockClub,
        creator: { id: 1, username: 'testuser' },
        currentBook: mockBook
      });

      const response = await request(app)
        .post('/bookclub')
        .send(newClubData)
        .expect(201);

      expect(response.body).toHaveProperty('id', 1);
      expect(response.body).toHaveProperty('name', newClubData.name);
    });

    it('should return 400 if required fields are missing', async () => {
      const response = await request(app)
        .post('/bookclub')
        .send({})
        .expect(400);

      expect(response.body).toHaveProperty('error', 'Required fields missing');
    });
  });

  describe('POST /bookclub/:id/join', () => {
    it('should join book club successfully', async () => {
      const mockClub = {
        id: 1,
        name: 'Test Club',
        addMember: jest.fn().mockResolvedValue(true)
      };

      BookClub.findByPk.mockResolvedValue(mockClub);

      const response = await request(app)
        .post('/bookclub/1/join')
        .expect(200);

      expect(response.body).toHaveProperty('message', 'Successfully joined the book club');
      expect(mockClub.addMember).toHaveBeenCalledWith(1);
    });

    it('should return 404 if book club not found', async () => {
      BookClub.findByPk.mockResolvedValue(null);

      const response = await request(app)
        .post('/bookclub/999/join')
        .expect(404);

      expect(response.body).toHaveProperty('error', 'Book club not found');
    });
  });
});