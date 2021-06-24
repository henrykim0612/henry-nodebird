const DataTypes = require('sequelize');
const { Model } = DataTypes;

module.exports = class Post extends Model {
  static init(sequelize) {
    return super.init({
      // id 는 기본적으로 들어있다.
      content: {
        type: DataTypes.TEXT,
        allowNull: false, // 필수
      },
      // UserId
      // PostId -> RetweetId
    }, {
      modelName: 'Post',
      tableName: 'posts',
      charset: 'utf8mb4',
      collate: 'utf8mb4_general_ci', // 한글 저장되도록 (mb4 로 이모티콘까지)
      sequelize,
    });
  }
  static associate(db) {
    db.Post.belongsTo(db.User); // post.addUser, post.getUser, removeUser, setUser (belongsTo 는 단수)
    db.Post.belongsToMany(db.User, {through: 'Like', as: 'Likers'}); // 다대다 관계, 위의 db.User 와 헷갈리므로 as 지정. // belongsToMany 설정으로 post.addLikers, post.removeLikers 라는 메서드를 이용할 수 있게됨.
    db.Post.belongsToMany(db.Hashtag, {through: 'PostHashtag'}); // 다대다 관계 // post.addHashtags
    db.Post.hasMany(db.Comment);// post.addComments
    db.Post.hasMany(db.Image); // hasMany 설정으로 post.addImages 메서드가 생겨남
    db.Post.belongsTo(db.Post, {as: 'Retweet'}); // 리트윗 // post.addRetweet
  }
}

// module.exports = (sequelize, DataTypes) => {
//   const Post = sequelize.define('Post', { // users 로 DB에 저장됨
//     // id 는 기본적으로 들어있다.
//     content: {
//       type: DataTypes.TEXT,
//       allowNull: false, // 필수
//     },
//     // UserId
//     // PostId -> RetweetId
//   }, {
//     charset: 'utf8mb4',
//     collate: 'utf8mb4_general_ci', // 한글 저장되도록 (mb4 로 이모티콘까지)
//   });
//   Post.associate = (db) => {
//     db.Post.belongsTo(db.User); // post.addUser, post.getUser, removeUser, setUser (belongsTo 는 단수)
//     db.Post.belongsToMany(db.User, {through: 'Like', as: 'Likers'}); // 다대다 관계, 위의 db.User 와 헷갈리므로 as 지정. // belongsToMany 설정으로 post.addLikers, post.removeLikers 라는 메서드를 이용할 수 있게됨.
//     db.Post.belongsToMany(db.Hashtag, {through: 'PostHashtag'}); // 다대다 관계 // post.addHashtags
//     db.Post.hasMany(db.Comment);// post.addComments
//     db.Post.hasMany(db.Image); // hasMany 설정으로 post.addImages 메서드가 생겨남
//     db.Post.belongsTo(db.Post, {as: 'Retweet'}); // 리트윗 // post.addRetweet
//   };
//   return Post;
// }