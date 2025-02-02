'use strict';

module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.bulkInsert('users', [
      {
        username: 'unique_user1',
        email: 'user1@example.com',
        password_hash: 'password_hash1',
        created_at: new Date(),
        updated_at: new Date(),
      },
      {
        username: 'unique_user2',
        email: 'user2@example.com',
        password_hash: 'password_hash2',
        created_at: new Date(),
        updated_at: new Date(),
      },
      {
        username: 'unique_user3',
        email: 'user3@example.com',
        password_hash: 'password_hash3',
        created_at: new Date(),
        updated_at: new Date(),
      },
      {
        username: 'unique_user4',
        email: 'user4@example.com',
        password_hash: 'password_hash4',
        created_at: new Date(),
        updated_at: new Date(),
      },
    ], {});
  },

  down: async (queryInterface, Sequelize) => {
    await queryInterface.bulkDelete('users', null, {});
  }
};



