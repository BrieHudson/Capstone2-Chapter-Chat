'use strict';

module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.createTable('book_club_memberships', {
      id: {
        allowNull: false,
        autoIncrement: true,
        primaryKey: true,
        type: Sequelize.INTEGER
      },
      user_id: {
        type: Sequelize.INTEGER,
        allowNull: false,
        references: {
          model: 'users',
          key: 'id'
        },
        onDelete: 'CASCADE'
      },
      book_club_id: {
        type: Sequelize.INTEGER,
        allowNull: false,
        references: {
          model: 'book_clubs',
          key: 'id'
        },
        onDelete: 'CASCADE'
      },
      joined_at: {
        type: Sequelize.DATE,
        defaultValue: Sequelize.literal('CURRENT_TIMESTAMP')
      }
    });

    // Add unique constraint
    await queryInterface.addConstraint('book_club_memberships', {
      fields: ['user_id', 'book_club_id'],
      type: 'unique',
      name: 'unique_user_bookclub_membership'
    });
  },

  down: async (queryInterface, Sequelize) => {
    await queryInterface.dropTable('book_club_memberships');
  }
};
