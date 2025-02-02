const request = require('supertest');
const express = require('express');
const fs = require('fs');
const path = require('path');
const app = require('../app'); 
const db = require('../db'); 

beforeAll(async () => {
   // Read the seed SQL file and execute it on the test database
   const seedFilePath = path.join(__dirname, '../chap_chat_seed.sql');  // Adjust the path if necessary
   const seedData = fs.readFileSync(seedFilePath, 'utf8');
   
   // Execute the seed SQL script to populate the test database
   await db.query(seedData);
});

afterEach(async () => {
  // Clear test database entries or rollback transactions
  await db.query(`DELETE FROM reading_list`);
});

afterAll(async () => {
  // Close database connection
  await db.end();
});

describe('ReadingList Routes', () => {
  describe('GET /readingList/:userId/:status', () => {
    it('should return books by status', async () => {
      const userId = 123;
      const status = 'want_to_read';

      const res = await request(app).get(`/readingList/${userId}/${status}`);
      expect(res.status).toBe(200);
      expect(res.body).toEqual(
        expect.arrayContaining([
          expect.objectContaining({ userId: 123, status: 'want_to_read' }),
        ])
      );
    });

    it('should return 404 if no books found', async () => {
      const userId = 999; // Ensure this user has no entries in the seed data
      const status = 'read';

      const res = await request(app).get(`/readingList/${userId}/${status}`);
      expect(res.status).toBe(404);
      expect(res.body.message).toBe(`No books found with status ${status}`);
    });
  });

  describe('POST /readingList', () => {
    it('should add a book to the reading list', async () => {
      const newBook = { userId: 124, bookId: 789, status: 'reading' };

      const res = await request(app).post('/readingList').send(newBook);
      expect(res.status).toBe(201);
      expect(res.body).toEqual(expect.objectContaining(newBook));
    });

    it('should return 400 for missing fields', async () => {
      const newBook = { userId: 124, bookId: 789 }; // Missing status

      const res = await request(app).post('/readingList').send(newBook);
      expect(res.status).toBe(400);
      expect(res.body.error).toBe('userId, bookId, and status are required');
    });
  });

  describe('PUT /readingList/:userId/:bookId', () => {
    it('should update the status of a book', async () => {
      const userId = 123;
      const bookId = 456;
      const updatedStatus = { status: 'read' };

      const res = await request(app).put(`/readingList/${userId}/${bookId}`).send(updatedStatus);
      expect(res.status).toBe(200);
      expect(res.body).toEqual(expect.objectContaining(updatedStatus));
    });

    it('should return 404 if the book is not found', async () => {
      const userId = 999; // Ensure this user/book combo doesn't exist
      const bookId = 888;
      const updatedStatus = { status: 'read' };

      const res = await request(app).put(`/readingList/${userId}/${bookId}`).send(updatedStatus);
      expect(res.status).toBe(404);
      expect(res.body.message).toBe('Reading list entry not found');
    });
  });

  describe('GET /readingList/:userId', () => {
    it('should return all books in the user\'s reading list', async () => {
      const userId = 123;

      const res = await request(app).get(`/readingList/${userId}`);
      expect(res.status).toBe(200);
      expect(res.body).toEqual(
        expect.arrayContaining([
          expect.objectContaining({ userId: 123 }),
        ])
      );
    });

    it('should return 404 if no books are found', async () => {
      const userId = 999; // Ensure this user has no entries in the seed data

      const res = await request(app).get(`/readingList/${userId}`);
      expect(res.status).toBe(404);
      expect(res.body.message).toBe('No books found in the reading list');
    });
  });
});

