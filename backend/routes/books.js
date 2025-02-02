const express = require("express");
const axios = require("axios");
const router = express.Router();
const Book = require("../models/books");

const GOOGLE_BOOKS_BASE_URL = "https://www.googleapis.com/books/v1";

// Search for Books
router.get("/search", async (req, res) => {
  const { q, maxResults = 10 } = req.query;

  if (!q) return res.status(400).json({ error: "Query parameter 'q' is required" });

  const url = `${GOOGLE_BOOKS_BASE_URL}/volumes?q=${q}&maxResults=${maxResults}&key=${process.env.GOOGLE_BOOKS_API_KEY}`;

  try {
    const { data } = await axios.get(url);
    res.json(data);
  } catch (error) {
    res.status(500).json({ error: "Failed to fetch books" });
  }
});

// Get Book Details
router.get("/:id", async (req, res) => {
  const { id } = req.params;

  try {
    const book = await Book.getById(id);
    if (book) return res.json(book);

    const url = `${GOOGLE_BOOKS_BASE_URL}/volumes/${id}?key=${process.env.GOOGLE_BOOKS_API_KEY}`;
    const { data } = await axios.get(url);
    res.json(data);
  } catch (error) {
    res.status(500).json({ error: "Failed to fetch book details" });
  }
});

module.exports = router;



