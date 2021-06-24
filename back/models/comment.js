// 이건 최신문법
const DataTypes = require('sequelize');
const { Model } = DataTypes;

module.exports = class Comment extends Model {
  static init(sequelize) {
    return super.init({
      // id 는 기본적으로 들어있다.
      content: {
        type: DataTypes.TEXT,
        allowNull: false, // 필수
      },
      // belongsTo 가 생기는 테이블에는 아래처럼 UserId, PostId 가 생긴다.
      // UserId: 1,
      // PostId: 3,
    }, {
      modelName: 'Comment',
      tableName: 'comments',
      charset: 'utf8mb4',
      collate: 'utf8mb4_general_ci', // 한글 저장되도록 (mb4 로 이모티콘까지)
      sequelize,
    });
  }

  static associate(db) {
    db.Comment.belongsTo(db.User);
    db.Comment.belongsTo(db.Post);
  }
};


// 이건 예전 문법
// module.exports = (sequelize, DataTypes) => {
//   const Comment = sequelize.define('Comment', { // users 로 DB에 저장됨
//     // id 는 기본적으로 들어있다.
//     content: {
//       type: DataTypes.TEXT,
//       allowNull: false, // 필수
//     },
//     // belongsTo 가 생기는 테이블에는 아래처럼 UserId, PostId 가 생긴다.
//     // UserId: 1,
//     // PostId: 3,
//   }, {
//     charset: 'utf8mb4',
//     collate: 'utf8mb4_general_ci', // 한글 저장되도록 (mb4 로 이모티콘까지)
//   });
//   Comment.associate = (db) => {
//     db.Comment.belongsTo(db.User);
//     db.Comment.belongsTo(db.Post);
//   };
//   return Comment;
// }