const DataTypes = require('sequelize');
const { Model } = DataTypes;

module.exports = class Image extends Model {
  static init(sequelize) {
    return super.init({
      // id 는 기본적으로 들어있다.
      src: {
        type: DataTypes.STRING(200),
        allowNull: false, // 필수
      },
    }, {
      modelName: 'Image',
      tableName: 'images',
      charset: 'utf8',
      collate: 'utf8_general_ci', // 한글 저장되도록
      sequelize,
    });
  }
  static associate(db) {
    db.Image.belongsTo(db.Post);
  }
}

// module.exports = (sequelize, DataTypes) => {
//   const Image = sequelize.define('Image', { // users 로 DB에 저장됨
//     // id 는 기본적으로 들어있다.
//     src: {
//       type: DataTypes.STRING(200),
//       allowNull: false, // 필수
//     },
//   }, {
//     charset: 'utf8',
//     collate: 'utf8_general_ci', // 한글 저장되도록
//   });
//   Image.associate = (db) => {
//     db.Image.belongsTo(db.Post);
//   };
//   return Image;
// }