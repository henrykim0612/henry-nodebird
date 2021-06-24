const DataTypes = require('sequelize');
const { Model } = DataTypes;

module.exports = class Hashtag extends Model {
  static init(sequelize) {
    return super.init({
      // id 는 기본적으로 들어있다.
      name: {
        type: DataTypes.STRING(20),
        allowNull: false, // 필수
      },
    }, {
      modelName: 'Hashtag',
      tableName: 'hashtags',
      charset: 'utf8mb4',
      collate: 'utf8mb4_general_ci',
      sequelize,
    });
  }
  static associate(db) {
    db.Hashtag.belongsToMany(db.Post, db.Post.belongsToMany(db.Hashtag, {through: 'PostHashtag'}));
  }
}

// module.exports = (sequelize, DataTypes) => {
//   const Hashtag = sequelize.define('Hashtag', { // users 로 DB에 저장됨
//     // id 는 기본적으로 들어있다.
//     name: {
//       type: DataTypes.STRING(20),
//       allowNull: false, // 필수
//     },
//   }, {
//     charset: 'utf8mb4',
//     collate: 'utf8mb4_general_ci',
//   });
//   Hashtag.associate = (db) => {
//     db.Hashtag.belongsToMany(db.Post, db.Post.belongsToMany(db.Hashtag, {through: 'PostHashtag'}));
//   };
//   return Hashtag;
// }