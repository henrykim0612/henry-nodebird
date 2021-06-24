const DataTypes = require('sequelize');
const { Model } = DataTypes;

module.exports = class User extends Model {
  static init(sequelize) {
    return super.init({
      // id 는 기본적으로 들어있다.
      email: {
        type: DataTypes.STRING(30),
        allowNull: false, // 필수
        unique: true, //고유한 값
      },
      nickname: {
        type: DataTypes.STRING(30),
        allowNull: false, // 필수
      },
      password: {
        type: DataTypes.STRING(100),
        allowNull: false, // 필수
      },
    }, {
      modelName: 'User',
      tableName: 'users',
      charset: 'utf8',
      collate: 'utf8_general_ci', // 한글 저장되도록
      sequelize,
    });
  }
  static associate(db) {
    db.User.hasMany(db.Post);
    db.User.belongsToMany(db.Post, {through: 'Like', as: 'Liked'});
    db.User.hasMany(db.Comment);
    db.User.belongsToMany(db.User, {through: 'Follow', as: 'Followers', foreignKey: 'followingId'});
    db.User.belongsToMany(db.User, {through: 'Follow', as: 'Followings', foreignKey: 'followerId'});
  }
}

// module.exports = (sequelize, DataTypes) => {
//   const User = sequelize.define('User', { // users 로 DB에 저장됨
//     // id 는 기본적으로 들어있다.
//     email: {
//       type: DataTypes.STRING(30),
//       allowNull: false, // 필수
//       unique: true, //고유한 값
//     },
//     nickname: {
//       type: DataTypes.STRING(30),
//       allowNull: false, // 필수
//     },
//     password: {
//       type: DataTypes.STRING(100),
//       allowNull: false, // 필수
//     },
//   }, {
//     charset: 'utf8',
//     collate: 'utf8_general_ci', // 한글 저장되도록
//   });
//   User.associate = (db) => {
//     db.User.hasMany(db.Post);
//     db.User.belongsToMany(db.Post, {through: 'Like', as: 'Liked'});
//     db.User.hasMany(db.Comment);
//     db.User.belongsToMany(db.User, {through: 'Follow', as: 'Followers', foreignKey: 'followingId'});
//     db.User.belongsToMany(db.User, {through: 'Follow', as: 'Followings', foreignKey: 'followerId'});
//   };
//   return User;
// }