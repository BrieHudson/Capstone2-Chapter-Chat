const { Model, DataTypes } = require('sequelize');

module.exports = (sequelize) => {
  class BookClubMembership extends Model {}

  BookClubMembership.init({
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true
    },
    user_id: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: {
        model: 'users',
        key: 'id'
      }
    },
    book_club_id: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: {
        model: 'book_clubs',
        key: 'id'
      }
    },
    joined_at: {
      type: DataTypes.DATE,
      allowNull: false,
      defaultValue: sequelize.literal('CURRENT_TIMESTAMP')
    }
  }, {
    sequelize,
    modelName: 'BookClubMembership',
    tableName: 'book_club_memberships',
    timestamps: false
  });

  BookClubMembership.associate = function(models) {
    BookClubMembership.belongsTo(models.User, {
      foreignKey: 'user_id'
    });
    
    BookClubMembership.belongsTo(models.BookClub, {
      foreignKey: 'book_club_id'
    });
  };

  return BookClubMembership;
};