const { DataTypes } = require('sequelize');

module.exports = (sequelize) => {
  const Forum = sequelize.define(
    'Forum',
    {
      id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true,
      },
      book_club_id: {  
        type: DataTypes.INTEGER,
        allowNull: false,
        references: {
          model: 'book_clubs',
          key: 'id',
        },
        onDelete: 'CASCADE'
      },
      user_id: {
        type: DataTypes.INTEGER,
        allowNull: false,
        references: {
          model: 'users',
          key: 'id',
        },
        onDelete: 'CASCADE'
      },
      book_id: {
        type: DataTypes.INTEGER,
        allowNull: true,  
        references: {
          model: 'books',
          key: 'id',
        },
        onDelete: 'SET NULL'
      },
      content: {
        type: DataTypes.TEXT,
        allowNull: false,
      },
      created_at: { 
        type: DataTypes.DATE,
        defaultValue: sequelize.literal('CURRENT_TIMESTAMP')
      }
    },
    {
      tableName: 'forum_posts',
      timestamps: true,
      createdAt: 'created_at',
      updatedAt: 'updated_at'
    }
  );

  Forum.associate = (models) => {
    Forum.belongsTo(models.BookClub, { 
      foreignKey: 'book_club_id',  
      as: 'bookClub' 
    });
    Forum.belongsTo(models.User, { 
      foreignKey: 'user_id', 
      as: 'user' 
    });
    Forum.belongsTo(models.Book, { 
      foreignKey: 'book_id', 
      as: 'book' 
    });
  };

  return Forum;
};

