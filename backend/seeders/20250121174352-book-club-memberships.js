'use strict';

module.exports = {
  up: async (queryInterface, Sequelize) => {
    // Get some existing user IDs and book club IDs
    const users = await queryInterface.sequelize.query(
      'SELECT id FROM users LIMIT 5;',
      { type: queryInterface.sequelize.QueryTypes.SELECT }
    );
    
    const bookClubs = await queryInterface.sequelize.query(
      'SELECT id FROM book_clubs LIMIT 3;',
      { type: queryInterface.sequelize.QueryTypes.SELECT }
    );

    const memberships = [];
    
    // Create some sample memberships
    for (const user of users) {
      for (const bookClub of bookClubs) {
        // Don't add all users to all clubs - add some randomness
        if (Math.random() > 0.3) {
          memberships.push({
            user_id: user.id,
            book_club_id: bookClub.id,
            joined_at: new Date()
          });
        }
      }
    }

    return queryInterface.bulkInsert('book_club_memberships', memberships, {});
  },

  down: async (queryInterface, Sequelize) => {
    return queryInterface.bulkDelete('book_club_memberships', null, {});
  }
};
