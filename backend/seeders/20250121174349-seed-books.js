'use strict';

module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.bulkInsert('books', [
      {
        title: 'To Kill a Mockingbird',
        author: 'Harper Lee',
        genre: 'Fiction',
        isbn: '9780061120084',
        description: 'A novel about racial inequality in the Deep South.',
        thumbnail_url: 'https://example.com/to_kill_a_mockingbird.jpg',
        created_at: new Date(),
        updated_at: new Date(),
      },
      {
        title: 'Dune',
        author: 'Frank Herbert',
        genre: 'Science Fiction',
        isbn: '9780441013593',
        description: 'A science fiction novel about a desert planet.',
        thumbnail_url: 'https://example.com/dune.jpg',
        created_at: new Date(),
        updated_at: new Date(),
      },
      {
        title: '1984',
        author: 'George Orwell',
        genre: 'Dystopia',
        isbn: '9780451524935',
        description: 'A dystopian novel set in a totalitarian state.',
        thumbnail_url: 'https://example.com/1984.jpg',
        created_at: new Date(),
        updated_at: new Date(),
      },
      {
        title: 'Pride and Prejudice',
        author: 'Jane Austen',
        genre: 'Romance',
        isbn: '9781503290563',
        description: 'A romantic novel set in the early 19th century.',
        thumbnail_url: 'https://example.com/pride_and_prejudice.jpg',
        created_at: new Date(),
        updated_at: new Date(),
      },
    ], {});
  },

  down: async (queryInterface, Sequelize) => {
    await queryInterface.bulkDelete('books', null, {});
  }
};


