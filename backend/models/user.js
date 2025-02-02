const { DataTypes, Model } = require('sequelize');

module.exports = (sequelize) => {
  class User extends Model {}

  User.init(
    {
      username: {
        type: DataTypes.STRING,
        allowNull: false,
      },
      email: {
        type: DataTypes.STRING,
        allowNull: false,
        unique: true,
      },
      password: {
        type: DataTypes.STRING,
        allowNull: false,
      }
    },
    {
      sequelize,
      modelName: 'User',
      tableName: 'users',
      timestamps: false,
    }
  );

  User.associate = (models) => {
    User.hasMany(models.BookClub, { foreignKey: 'creator_id', as: 'createdClubs' });
    User.hasMany(models.ReadingList, { foreignKey: 'user_id', as: 'readingList' });
  };

  return User;
};


