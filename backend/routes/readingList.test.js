const request = require('supertest');
const express = require('express');
const ReadingList = require('../models/readingList');
const readingListRoutes = require('../routes/readingList');

// Mock authentication middleware
jest.mock('../middleware/authMiddleware', () => ({
  authenticate: (req, res, next) => {
    req.user = { id: 1 };
    next();
  }
}));

// Mock ReadingList model and sequelize
jest.mock('../models/readingList', () => {
  const mockModel = () => ({
    getAllByUserGrouped: jest.fn(),
    addBook: jest.fn(),
    moveBook: jest.fn(),
    deleteBook: jest.fn(),
    associate: jest.fn()
  });
  return mockModel;
});

jest.mock('../models', () => ({
  sequelize: {
    models: {}
  }
}));

const readingListModel = ReadingList();
const app = express();
app.use(express.json());
app.use('/reading-list', readingListRoutes);

describe('Reading List Routes', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('GET /reading-list', () => {
    const mockLists = {
      want_to_read: [{ id: 1, title: 'Book 1' }],
      reading: [{ id: 2, title: 'Book 2' }],
      read: [{ id: 3, title: 'Book 3' }]
    };

    it('should successfully get reading lists', async () => {
      readingListModel.getAllByUserGrouped.mockResolvedValue(mockLists);

      const response = await request(app)
        .get('/reading-list')
        .expect(200);

      expect(response.body).toEqual({
        toRead: mockLists.want_to_read,
        reading: mockLists.reading,
        completed: mockLists.read
      });
      expect(readingListModel.getAllByUserGrouped).toHaveBeenCalledWith(1);
    });

    it('should return 500 on database error', async () => {
      readingListModel.getAllByUserGrouped.mockRejectedValue(new Error('Database error'));

      const response = await request(app)
        .get('/reading-list')
        .expect(500);

      expect(response.body).toHaveProperty('error', 'Internal server error');
    });
  });

  describe('POST /reading-list/add', () => {
    const mockBookData = {
      book: {
        id: 'book1',
        title: 'Test Book'
      },
      list: 'want_to_read'
    };

    it('should successfully add a book to reading list', async () => {
      readingListModel.addBook.mockResolvedValue({
        id: 1,
        ...mockBookData.book
      });

      const response = await request(app)
        .post('/reading-list/add')
        .send(mockBookData)
        .expect(200);

      expect(response.body).toEqual({
        success: true,
        book: {
          id: 1,
          ...mockBookData.book
        }
      });
      expect(readingListModel.addBook).toHaveBeenCalledWith(
        1,
        mockBookData.book,
        mockBookData.list
      );
    });

    it('should return 400 for invalid list type', async () => {
      const response = await request(app)
        .post('/reading-list/add')
        .send({
          ...mockBookData,
          list: 'invalid_list'
        })
        .expect(400);

      expect(response.body).toHaveProperty('error', 'Invalid list type');
    });

    it('should return 500 on database error', async () => {
      readingListModel.addBook.mockRejectedValue(new Error('Database error'));

      const response = await request(app)
        .post('/reading-list/add')
        .send(mockBookData)
        .expect(500);

      expect(response.body).toEqual({
        success: false,
        error: 'Internal server error',
        details: 'Database error'
      });
    });
  });

  describe('PUT /reading-list/move', () => {
    const mockMoveData = {
      bookId: 1,
      fromList: 'want_to_read',
      toList: 'reading'
    };

    it('should successfully move a book between lists', async () => {
      readingListModel.moveBook.mockResolvedValue({ success: true });

      const response = await request(app)
        .put('/reading-list/move')
        .send(mockMoveData)
        .expect(200);

      expect(response.body).toEqual({
        success: true,
        result: { success: true }
      });
      expect(readingListModel.moveBook).toHaveBeenCalledWith(
        1,
        mockMoveData.bookId,
        mockMoveData.fromList,
        mockMoveData.toList
      );
    });

    it('should return 400 if bookId is missing', async () => {
      const response = await request(app)
        .put('/reading-list/move')
        .send({
          fromList: 'want_to_read',
          toList: 'reading'
        })
        .expect(400);

      expect(response.body).toEqual({
        success: false,
        error: 'Missing bookId'
      });
    });

    it('should return 400 for invalid list types', async () => {
      const response = await request(app)
        .put('/reading-list/move')
        .send({
          ...mockMoveData,
          fromList: 'invalid_list'
        })
        .expect(400);

      expect(response.body).toEqual({
        success: false,
        error: 'Invalid fromList status: invalid_list',
        validStatuses: ['want_to_read', 'reading', 'read']
      });
    });
  });

  describe('DELETE /reading-list/:bookId', () => {
    it('should successfully delete a book from reading list', async () => {
      readingListModel.deleteBook.mockResolvedValue(true);

      const response = await request(app)
        .delete('/reading-list/1')
        .expect(200);

      expect(response.body).toEqual({
        success: true,
        message: 'Book removed successfully'
      });
      expect(readingListModel.deleteBook).toHaveBeenCalledWith(1, '1');
    });

    it('should return 500 on database error', async () => {
      readingListModel.deleteBook.mockRejectedValue(new Error('Database error'));

      const response = await request(app)
        .delete('/reading-list/1')
        .expect(500);

      expect(response.body).toEqual({
        success: false,
        error: 'Internal server error',
        details: 'Database error'
      });
    });
  });
});

