const { User, BookClub } = require('../models');

const Admin = {
  // Ban a user by setting a 'banned' flag
  async banUser(userId) {
    const user = await User.findByPk(userId);
    if (!user) return null;

    user.banned = true; // Assuming the User model has a 'banned' field
    await user.save();
    return user;
  },

  // Delete a book club by its ID
  async deleteBookClub(bookClubId) {
    const bookClub = await BookClub.findByPk(bookClubId);
    if (!bookClub) return null;

    await bookClub.destroy();
    return bookClub;
  },
};

module.exports = Admin;
