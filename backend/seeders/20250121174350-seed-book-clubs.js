'use strict';

module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.bulkInsert('book_clubs', [
      {
        name: 'Fiction Fans',
        description: 'A club for fiction lovers.',
        creator_id: 1, // Assuming user with ID 1 is the creator
        meeting_time: '2025-01-20 19:00:00',
        book_id: 1, // Assuming "To Kill a Mockingbird" has ID 1
        created_at: new Date(),
        updated_at: new Date(),
      },
      {
        name: 'Sci-Fi Enthusiasts',
        description: 'Exploring the universe of sci-fi.',
        creator_id: 2, // Assuming user with ID 2 is the creator
        meeting_time: '2025-01-27 19:00:00',
        book_id: 2, // Assuming "Dune" has ID 2
        created_at: new Date(),
        updated_at: new Date(),
      },
      {
        name: 'Dystopia Readers',
        description: 'A club for fans of dystopian fiction.',
        creator_id: 3, // Assuming user with ID 3 is the creator
        meeting_time: '2025-02-03 19:00:00',
        book_id: 3, // Assuming "1984" has ID 3
        created_at: new Date(),
        updated_at: new Date(),
      },
      {
        name: 'Romantic Reads',
        description: 'A club for those who love romance novels.',
        creator_id: 4, // Assuming user with ID 4 is the creator
        meeting_time: '2025-02-10 19:00:00',
        book_id: 4, // Assuming "Pride and Prejudice" has ID 4
        created_at: new Date(),
        updated_at: new Date(),
      },
    ], {});
  },

  down: async (queryInterface, Sequelize) => {
    await queryInterface.bulkDelete('book_clubs', null, {});
  }
};


