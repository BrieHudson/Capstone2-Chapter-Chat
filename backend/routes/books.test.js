const request = require('supertest');
const express = require('express');
const fs = require('fs');
const path = require('path');
const db = require('../db'); 
const app = require('../app'); 
const booksRouter = require('./books'); 

// Middleware to parse JSON
app.use(express.json());

// Use the books router for testing
app.use('/api/books', booksRouter);

// Setup and teardown hooks
beforeAll(async () => {
  const seedFilePath = path.join(__dirname, '../chap_chat_seed.sql');
  console.log('Seed file path:', seedFilePath); // Debugging step
  
  try {
    const seedData = fs.readFileSync(seedFilePath, 'utf8');
    console.log('Seed data loaded:', seedData); // Debugging step
    await db.query(seedData);
  } catch (err) {
    console.error('Error seeding the database:', err);
    throw err;
  }
});


afterEach(async () => {
  // Clear test data to ensure isolation
  await db.query(`DELETE FROM books`);
});

afterAll(async () => {
  // Close database connection
  await db.end();
});

// Define test cases
describe('Books API Routes', () => {
  it('should return book data with default maxResults', async () => {
    const response = await request(app)
      .get('/api/books/search?q=Harry+Potter'); 

    expect(response.status).toBe(200);
    expect(response.body).toHaveProperty('items');
    expect(response.body.items[0].volumeInfo).toHaveProperty('title', 'Harry Potter and the Sorcerer\'s Stone');
    expect(response.body.items[0].volumeInfo.industryIdentifiers[0]).toHaveProperty('identifier', '9780439708180');
  });

  it('should return book data with specified maxResults', async () => {
    const response = await request(app)
      .get('/api/books/search?q=Harry+Potter&maxResults=5'); // maxResults is specified as 5

    expect(response.status).toBe(200);
    expect(response.body).toHaveProperty('items');
    expect(response.body.items[0].volumeInfo).toHaveProperty('title', 'Harry Potter and the Chamber of Secrets');
    expect(response.body.items[0].volumeInfo.industryIdentifiers[0]).toHaveProperty('identifier', '9780439064873');
  });

  it('should handle errors gracefully for missing query', async () => {
    const response = await request(app).get('/api/books/search');
    expect(response.status).toBe(400);
    expect(response.body).toHaveProperty('error', "Query parameter 'q' is required");
  });
});



