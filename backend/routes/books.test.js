const request = require('supertest');
const express = require('express');
const axios = require('axios');
const Book = require('../models/books');
const booksRoutes = require('../routes/books');

// Mock axios
jest.mock('axios');

// Mock Book model
jest.mock('../models/books', () => ({
  getById: jest.fn()
}));

const app = express();
app.use(express.json());
app.use('/books', booksRoutes);

describe('Books Routes', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    process.env.GOOGLE_BOOKS_API_KEY = 'test-api-key';
  });

  describe('GET /books/search', () => {
    const mockGoogleBooksResponse = {
      data: {
        items: [
          {
            id: 'book1',
            volumeInfo: {
              title: 'Test Book',
              authors: ['Test Author']
            }
          }
        ]
      }
    };

    it('should successfully search for books', async () => {
      axios.get.mockResolvedValue(mockGoogleBooksResponse);

      const response = await request(app)
        .get('/books/search')
        .query({ q: 'test book' })
        .expect(200);

      expect(axios.get).toHaveBeenCalledWith(
        expect.stringContaining('/volumes?q=test%20book')
      );
      expect(response.body).toEqual(mockGoogleBooksResponse.data);
    });

    it('should return 400 if query parameter is missing', async () => {
      const response = await request(app)
        .get('/books/search')
        .expect(400);

      expect(response.body).toHaveProperty('error', "Query parameter 'q' is required");
    });

    it('should return 500 on API error', async () => {
      axios.get.mockRejectedValue(new Error('API Error'));

      const response = await request(app)
        .get('/books/search')
        .query({ q: 'test book' })
        .expect(500);

      expect(response.body).toHaveProperty('error', 'Failed to fetch books');
    });
  });

  describe('GET /books/:id', () => {
    const mockBookData = {
      id: 'book1',
      title: 'Test Book',
      author: 'Test Author'
    };

    it('should return book from database if found', async () => {
      Book.getById.mockResolvedValue(mockBookData);

      const response = await request(app)
        .get('/books/book1')
        .expect(200);

      expect(response.body).toEqual(mockBookData);
      expect(axios.get).not.toHaveBeenCalled();
    });

    it('should fetch from Google Books API if not in database', async () => {
      Book.getById.mockResolvedValue(null);
      axios.get.mockResolvedValue({ data: mockBookData });

      const response = await request(app)
        .get('/books/book1')
        .expect(200);

      expect(axios.get).toHaveBeenCalledWith(
        expect.stringContaining('/volumes/book1')
      );
      expect(response.body).toEqual(mockBookData);
    });

    it('should return 500 on error', async () => {
      Book.getById.mockRejectedValue(new Error('Database error'));

      const response = await request(app)
        .get('/books/book1')
        .expect(500);

      expect(response.body).toHaveProperty('error', 'Failed to fetch book details');
    });
  });
});



