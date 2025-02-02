-- Seed Users
INSERT INTO users (username, email, password_hash)
VALUES
('unique_user1', 'user1@example.com', 'password_hash1'),
('unique_user2', 'user2@example.com', 'password_hash2');

-- Seed Books
INSERT INTO books (id, title, author, genre, isbn, description, thumbnail_url)
VALUES
(1, 'To Kill a Mockingbird', 'Harper Lee', 'Fiction', '9780061120084', 'A novel about serious issues of rape and racial inequality.', 'https://example.com/tokillamockingbird.jpg'),
(2, 'Dune', 'Frank Herbert', 'Science Fiction', '9780441172719', 'A sci-fi novel about politics, religion, and power.', 'https://example.com/dune.jpg'),
(3, '1984', 'George Orwell', 'Dystopian', '9780451524935', 'A dystopian novel about totalitarianism and surveillance.', 'https://example.com/1984.jpg'),
(4, 'Pride and Prejudice', 'Jane Austen', 'Romance', '9781503290563', 'A classic novel about love and social standing.', 'https://example.com/prideandprejudice.jpg');

-- Seed Book Clubs
INSERT INTO book_clubs (name, description, creator_id, meeting_time, book_id)
VALUES
('Fiction Fans', 'A club for fiction lovers.', 1, '2025-01-20 19:00:00', 1),
('Sci-Fi Enthusiasts', 'Exploring the universe of sci-fi.', 2, '2025-01-27 19:00:00', 2);

-- Seed reading list
INSERT INTO reading_lists (user_id, book_id, status)
VALUES
(1, 1, 'want_to_read'),
(1, 2, 'reading'),
(1, 3, 'read'),
(2, 2, 'want_to_read'),
(2, 4, 'reading');