const request = require('supertest');
const express = require('express');
const { Forum, User, BookClub } = require('../models');
const forumRoutes = require('../routes/forums');

// Mock authentication middleware
jest.mock('../middleware/authMiddleware', () => ({
  authenticate: (req, res, next) => {
    req.user = { id: 1 };
    next();
  }
}));

// Mock models
jest.mock('../models', () => ({
  Forum: {
    findAll: jest.fn(),
    findByPk: jest.fn(),
    create: jest.fn()
  },
  User: {
    findOne: jest.fn()
  },
  BookClub: {
    findByPk: jest.fn()
  }
}));

const app = express();
app.use(express.json());
app.use('/forums', forumRoutes);

describe('Forums Routes', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('GET /forums/:clubId', () => {
    const mockPosts = [
      {
        id: 1,
        content: 'Test post',
        user: {
          id: 1,
          username: 'testuser'
        },
        created_at: new Date().toISOString()
      }
    ];

    it('should successfully get forum posts', async () => {
      Forum.findAll.mockResolvedValue(mockPosts);

      const response = await request(app)
        .get('/forums/1')
        .expect(200);

      expect(response.body).toEqual(mockPosts);
      expect(Forum.findAll).toHaveBeenCalledWith({
        where: {
          book_club_id: '1'
        },
        include: [
          {
            model: User,
            as: 'user',
            attributes: ['id', 'username']
          }
        ],
        order: [['created_at', 'DESC']]
      });
    });

    it('should return 500 on database error', async () => {
      Forum.findAll.mockRejectedValue(new Error('Database error'));

      const response = await request(app)
        .get('/forums/1')
        .expect(500);

      expect(response.body).toHaveProperty('error', 'Internal server error');
    });
  });

  describe('POST /forums/:clubId', () => {
    const mockPostData = {
      content: 'Test post content',
      contains_spoilers: false
    };

    const mockBookClub = {
      id: 1,
      current_book_id: 1,
      hasMembers: jest.fn()
    };

    const mockCreatedPost = {
      id: 1,
      book_club_id: 1,
      user_id: 1,
      content: 'Test post content',
      contains_spoilers: false,
      created_at: new Date().toISOString(),
      user: {
        id: 1,
        username: 'testuser'
      }
    };

    it('should successfully create a forum post for club member', async () => {
      // Mock book club exists and user is a member
      BookClub.findByPk.mockResolvedValue(mockBookClub);
      mockBookClub.hasMembers.mockResolvedValue(true);
      
      // Mock post creation
      Forum.create.mockResolvedValue({
        id: 1,
        ...mockPostData,
        book_club_id: 1,
        user_id: 1
      });

      // Mock fetching created post with user details
      Forum.findByPk.mockResolvedValue(mockCreatedPost);

      const response = await request(app)
        .post('/forums/1')
        .send(mockPostData)
        .expect(201);

      expect(response.body).toEqual(mockCreatedPost);
      expect(Forum.create).toHaveBeenCalledWith({
        book_club_id: '1',
        user_id: 1,
        content: mockPostData.content,
        book_id: mockBookClub.current_book_id,
        contains_spoilers: mockPostData.contains_spoilers
      });
    });

    it('should return 404 if book club not found', async () => {
      BookClub.findByPk.mockResolvedValue(null);

      const response = await request(app)
        .post('/forums/1')
        .send(mockPostData)
        .expect(404);

      expect(response.body).toHaveProperty('error', 'Book club not found');
    });

    it('should return 403 if user is not a club member', async () => {
      BookClub.findByPk.mockResolvedValue(mockBookClub);
      mockBookClub.hasMembers.mockResolvedValue(false);

      const response = await request(app)
        .post('/forums/1')
        .send(mockPostData)
        .expect(403);

      expect(response.body).toHaveProperty('error', 'Must be a member to post');
    });

    it('should return 500 on database error', async () => {
      BookClub.findByPk.mockResolvedValue(mockBookClub);
      mockBookClub.hasMembers.mockResolvedValue(true);
      Forum.create.mockRejectedValue(new Error('Database error'));

      const response = await request(app)
        .post('/forums/1')
        .send(mockPostData)
        .expect(500);

      expect(response.body).toHaveProperty('error', 'Internal server error');
    });
  });
});