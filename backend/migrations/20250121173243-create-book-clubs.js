'use strict';
module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.createTable('book_clubs', {
      id: {
        allowNull: false,
        primaryKey: true,
        type: Sequelize.INTEGER,
        autoIncrement: true,
      },
      name: {
        type: Sequelize.STRING,
        allowNull: false,
      },
      description: {
        type: Sequelize.TEXT,
        allowNull: true,
      },
      image_url: {  // Add this line
        type: Sequelize.TEXT,
        allowNull: true,
      },
      creator_id: {
        type: Sequelize.INTEGER,
        references: {
          model: 'users',
          key: 'id',
        },
      },
      book_id: {
        type: Sequelize.INTEGER,
        references: {
          model: 'books',
          key: 'id',
        },
      },
      current_book_id: {  // Add this block
        type: Sequelize.INTEGER,
        allowNull: true,
        references: {
          model: 'books',
          key: 'id',
        },
      },
      meeting_time: {
        type: Sequelize.DATE,
        allowNull: false,
      },
      created_at: {
        allowNull: false,
        type: Sequelize.DATE,
        defaultValue: Sequelize.NOW,
      },
      updated_at: {
        allowNull: false,
        type: Sequelize.DATE,
        defaultValue: Sequelize.NOW,
      },
    });
  },
  down: async (queryInterface, Sequelize) => {
    await queryInterface.dropTable('book_clubs');
  }
};

