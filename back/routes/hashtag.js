const express = require('express')
const {Op} = require("sequelize");
const router = express.Router();
const {User, Post, Hashtag, Comment, Image} = require('../models');

router.get('/:hashtag', async (req, res, next) => {
  try {
    let where = {};
    if (parseInt(req.query.lastId, 10)) { // 초기 로딩이 아닐경우
      where.id = { [Op.lt]: parseInt(req.query.lastId, 10) };
    }
    const posts = await Post.findAll({
      where,
      limit: 10,
      order: [
        ['createdAt', 'DESC'],
        [Comment, 'createdAt', 'DESC'],
      ],
      include: [{
        model: Hashtag,
        where: {
          name: decodeURIComponent(req.params.hashtag),
        }
      },{
        model: Image,
      }, {
        model: User,
        attributes: ['id', 'nickname'],
      }, {
        model: Comment,
        include: [{
          model: User,
          attributes: ['id', 'nickname'],
        }]
      }, {
        model: User, // 좋아요 클릭한 사람
        as: 'Likers',
        attributes: ['id'],
      }, {
        model: Post,
        as: 'Retweet',
        include: [{
          model: User,
          attributes: ['id', 'nickname'],
        }, {
          model: Image,
        }]
      }],
    });
    res.status(200).json(posts);
  } catch(err) {
    console.error(err);
    next(err);
  }
});

module.exports = router;