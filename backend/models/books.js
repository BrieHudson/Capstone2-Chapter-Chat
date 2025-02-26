const { DataTypes, Model } = require('sequelize');

module.exports = (sequelize) => {
  class Book extends Model {}

  Book.init(
    {
      title: {
        type: DataTypes.STRING,
        allowNull: false,
      },
      author: {
        type: DataTypes.STRING,
        allowNull: false,
      },
      isbn: {
        type: DataTypes.STRING,
        allowNull: true,
      },
      description: {
        type: DataTypes.TEXT,
        allowNull: true,
      },
      thumbnail_url: {
        type: DataTypes.STRING,
        allowNull: true,
      },
      google_books_id: {
        type: DataTypes.STRING,
        allowNull: true,
      },
      genre: {
        type: DataTypes.STRING,
        allowNull: true,
      },
      published_date: {
        type: DataTypes.DATE,
        allowNull: true,
      },
    },
    {
      sequelize,
      modelName: 'Book',
      tableName: 'books',
      timestamps: true,
      createdAt: 'created_at',
      updatedAt: 'updated_at'
    }
  );

  Book.associate = (models) => {
    Book.hasMany(models.ReadingList, { foreignKey: 'book_id', as: 'readingListEntries' });
    Book.hasMany(models.BookClub, { foreignKey: 'current_book_id', as: 'bookClubs' });
  };

  return Book;
};


