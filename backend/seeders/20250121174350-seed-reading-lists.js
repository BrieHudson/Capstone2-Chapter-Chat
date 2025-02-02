'use strict';
module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.bulkInsert('reading_lists', [
      {
        user_id: 1, // Assuming user with ID 1
        book_id: 1, // Assuming "To Kill a Mockingbird" has ID 1
        status: 'want_to_read',
        created_at: new Date(),
        updated_at: new Date(),
      },
      {
        user_id: 1, // Assuming user with ID 1
        book_id: 2, // Assuming "Dune" has ID 2
        status: 'reading',
        created_at: new Date(),
        updated_at: new Date(),
      },
      {
        user_id: 1, // Assuming user with ID 1
        book_id: 3, // Assuming "1984" has ID 3
        status: 'read',
        created_at: new Date(),
        updated_at: new Date(),
      },
      {
        user_id: 2, // Assuming user with ID 2
        book_id: 2, // Assuming "Dune" has ID 2
        status: 'want_to_read',
        created_at: new Date(),
        updated_at: new Date(),
      },
      {
        user_id: 2, // Assuming user with ID 2
        book_id: 4, // Assuming "Pride and Prejudice" has ID 4
        status: 'reading',
        created_at: new Date(),
        updated_at: new Date(),
      },
    ]);
  },

  down: async (queryInterface, Sequelize) => {
    await queryInterface.bulkDelete('reading_lists', null, {});
  }
};

