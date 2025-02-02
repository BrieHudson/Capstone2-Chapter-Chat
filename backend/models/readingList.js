const { Model, DataTypes } = require('sequelize');

module.exports = (sequelize) => {
  class ReadingList extends Model {
    static associate(models) {
      this.belongsTo(models.User, { foreignKey: 'user_id', as: 'user' });
      this.belongsTo(models.Book, { foreignKey: 'book_id', as: 'book' });
    }

    static async addBook(userId, bookData, status) {
      const transaction = await this.sequelize.transaction();
      try {
        // First, create or find the book in the books table
        const [book] = await sequelize.models.Book.findOrCreate({
          where: { 
            title: bookData.title,
            author: bookData.author
          },
          defaults: {
            description: bookData.description,
            thumbnail_url: bookData.coverImage
          },
          transaction
        });
    
        // Then create the reading list entry
        const readingListEntry = await this.create({
          user_id: userId,
          book_id: book.id,
          status: status
        }, { transaction });
    
        await transaction.commit();
        return book;
      } catch (error) {
        await transaction.rollback();
        throw error;
      }
    }

    static async getAllByUserGrouped(userId) {
      try {
        const lists = await this.findAll({
          where: { user_id: userId },
          include: [
            { 
              model: sequelize.models.Book, 
              as: 'book',
              attributes: ['id', 'title', 'author', 'thumbnail_url'] 
            }
          ]
        });
    
        return {
          want_to_read: lists.filter(item => item.status === 'want_to_read').map(item => item.book),
          reading: lists.filter(item => item.status === 'reading').map(item => item.book),
          read: lists.filter(item => item.status === 'read').map(item => item.book)
        };
      } catch (error) {
        console.error('Error in getAllByUserGrouped:', error);  // Log any error that occurs
        throw error;
      }
    }
    

    static async moveBook(userId, bookId, fromStatus, toStatus) {
      const transaction = await this.sequelize.transaction();
    
      try {
        console.log('Moving book with params:', { userId, bookId, fromStatus, toStatus });
        
        const entry = await this.findOne({
          where: { 
            user_id: userId, 
            book_id: bookId, 
            status: fromStatus 
          },
          transaction
        });
    
        if (!entry) {
          await transaction.rollback();
          throw new Error(`Book not found in ${fromStatus} list`);
        }
    
        await entry.update({ status: toStatus }, { transaction });
        await transaction.commit();
    
        return entry;
      } catch (error) {
        await transaction.rollback();
        console.error('Error in moveBook:', error);
        throw error;
      }
    }

    static async deleteBook(userId, bookId) {
      return this.destroy({
        where: { user_id: userId, book_id: bookId }
      });
    }

    static async getByUserAndStatus(userId, status, limit = 10, offset = 0) {
      return this.findAll({
        where: { user_id: userId, status },
        include: [
          { 
            model: sequelize.models.Book, 
            as: 'book',
            attributes: ['id', 'title', 'author', 'thumbnail_url'] 
          }
        ],
        limit,
        offset
      });
    }
  }

  ReadingList.init({
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true
    },
    user_id: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: {
        model: 'Users',
        key: 'id'
      }
    },
    book_id: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: {
        model: 'Books',
        key: 'id'
      }
    },
    status: {
      type: DataTypes.ENUM('want_to_read', 'reading', 'read'),
      allowNull: false
    }
  }, {
    sequelize,
    modelName: 'ReadingList',
    tableName: 'reading_lists',
    timestamp: true,
    createdAt: 'created_at',
    updatedAt: 'updated_at'

  });

  return ReadingList;
};













