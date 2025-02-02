const { Sequelize, DataTypes, Model } = require('sequelize');

module.exports = (sequelize) => {
  class BookClub extends Model {
    static async getAllForUser(userId) {
      return this.findAll({
        include: [
          {
            model: sequelize.models.User,
            as: 'members',
            where: { id: userId },
            through: { attributes: ['joined_at'] }  
          },
          {
            model: sequelize.models.Book,
            as: 'currentBook',
            attributes: ['id', 'title', 'author', 'google_books_id', ['thumbnail_url', 'image_url'], 'description']
          },
          {
            model: sequelize.models.User,
            as: 'creator',
            attributes: ['id', 'username']
          }
        ]
      });
    }

    static async join(bookClubId, userId) {
      const membership = await sequelize.models.BookClubMembership.create({
        user_id: userId,
        book_club_id: bookClubId,
      });
      return membership;
    }

    static async updateClubDetails(bookClubId, userId, updateData) {
      const bookClub = await this.findByPk(bookClubId);
      if (!bookClub || bookClub.creator_id !== userId) {
        throw new Error('Unauthorized');
      }
      
      await bookClub.update(updateData);
      
      if (updateData.current_book_id) {
        await sequelize.models.Forum.destroy({
          where: { book_club_id: bookClubId }
        });
      }

      return bookClub;
    }
  }

  BookClub.init(
    {
      name: {
        type: DataTypes.STRING,
        allowNull: false,
      },
      description: {
        type: DataTypes.TEXT,
        allowNull: true,
      },
      image_url: {
        type: DataTypes.TEXT,  
        allowNull: true,
      },
      book_id: {  // Add this field
        type: DataTypes.INTEGER,
        allowNull: false,
        references: {
          model: 'books',
          key: 'id',
        },
      },
      current_book_id: {
        type: DataTypes.INTEGER,
        allowNull: false,  // Changed to false since it's required
        references: {
          model: 'books',
          key: 'id',
        },
      },
      meeting_time: {
        type: DataTypes.DATE,
        allowNull: false,  // Changed to false since it's required
      },
      creator_id: {
        type: DataTypes.INTEGER,
        allowNull: false,
        references: {
          model: 'users',
          key: 'id',
        },
      }
    },
    {
      sequelize,
      modelName: 'BookClub',
      tableName: 'book_clubs',
      timestamps: true,
      createdAt: 'created_at',
      updatedAt: false
    }
  );

  BookClub.associate = (models) => {
    BookClub.belongsTo(models.User, { foreignKey: 'creator_id', as: 'creator' });
    BookClub.belongsTo(models.Book, { foreignKey: 'current_book_id', as: 'currentBook' });
    BookClub.belongsTo(models.Book, { foreignKey: 'book_id', as: 'initialBook' });
    BookClub.belongsToMany(models.User, { 
      through: models.BookClubMembership, 
      foreignKey: 'book_club_id',
      otherKey: 'user_id',
      as: 'members'
    });
    
    BookClub.hasMany(models.Forum, { 
      foreignKey: 'book_club_id',
      as: 'forumPosts'
    });
  };

  return BookClub;
};


