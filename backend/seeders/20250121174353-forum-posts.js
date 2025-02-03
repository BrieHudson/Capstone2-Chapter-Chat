'use strict';

module.exports = {
  up: async (queryInterface, Sequelize) => {
    // Get existing users, book clubs, and books
    const users = await queryInterface.sequelize.query(
      'SELECT id FROM users LIMIT 5;',
      { type: queryInterface.sequelize.QueryTypes.SELECT }
    );
    
    const bookClubs = await queryInterface.sequelize.query(
      'SELECT id, book_id FROM book_clubs LIMIT 3;',
      { type: queryInterface.sequelize.QueryTypes.SELECT }
    );

    const samplePosts = [
      "Just started reading this book and I'm already hooked!",
      "What does everyone think about chapter 3?",
      "The character development in this book is amazing.",
      "Can't wait to discuss this at our next meeting!",
      "This book reminds me of another one we read last month."
    ];

    const posts = [];
    
    // Create sample forum posts
    for (const bookClub of bookClubs) {
      for (const user of users) {
        // Don't create posts for every user in every club
        if (Math.random() > 0.4) {
          posts.push({
            book_club_id: bookClub.id,
            user_id: user.id,
            book_id: bookClub.book_id,
            content: samplePosts[Math.floor(Math.random() * samplePosts.length)],
            created_at: new Date()
          });
        }
      }
    }

    return queryInterface.bulkInsert('forum_posts', posts, {});
  },

  down: async (queryInterface, Sequelize) => {
    return queryInterface.bulkDelete('forum_posts', null, {});
  }
};
