const express = require('express');
const { Post, Comment, Image, User, Hashtag } = require('../models');
const { isLoggedIn } = require('./middlewares');
const router = express.Router();
const multer = require('multer');
const path = require('path');
const fs = require('fs');

// 없으면 폴더 만들어줌
try {
  fs.accessSync('uploads');
} catch(err) {
  console.log('uploads 폴더가 없으므로 생성합니다.');
  fs.mkdirSync('uploads');
}

// 이미지 저장
const upload = multer({
  storage: multer.diskStorage({
    destination(req, file, done) {
      done(null, 'uploads');
    },
    filename(req, file, done) { // filename.png
      const ext = path.extname(file.originalname); // 확장자 추출(.png)
      const basename = path.basename(file.originalname, ext); // filename
      done(null, basename + '_' + new Date().getTime() + ext); // filename1235123123.png (시간을 붙여서 중복을 방지)
    },
  }),
  limits: {fileSize: 20 * 1024 * 1024}, // 20MB Limit
});

// 게시글 저장
router.post('/', isLoggedIn, upload.none(), async (req, res, next) => {
  try {
    // 저장
    const post = await Post.create({
      content: req.body.content,
      UserId: req.user.id,
    });

    const hashtags = req.body.content.match(/#[^\s#]+/g);
    if (hashtags) {
      const result = await Promise.all(
        hashtags.map((tag) => Hashtag.findOrCreate({
          where: { name: tag.slice(1).toLowerCase() }
        }))
      ); // 결과값이 [[노드, true], [리액트, true]]
      await post.addHashtags(result.map((v) => v[0]));
    }
    if (req.body.image) {
      if(Array.isArray(req.body.image)) { // 이미지를 여러개 올리면 image: [aaa.png, bbb.png]
        const images = await Promise.all(req.body.image.map((image) => Image.create({src: image})));
        await post.addImages(images);
      } else { // 이미지를 하나만 올리면 image: aa.png
        const image = await Image.create({src: req.body.image});
        await post.addImages(image);
      }
    }

    // 게시글의 각종정보까지 포함해서 리턴
    const fullPost = await Post.findOne({
      where: {id: post.id},
      include: [{
        model: Image,
      }, {
        model: Comment,
        include: [{
          model: User, // 댓글 작성자
          attributes: ['id', 'nickname'],
        }],
      }, {
        model: User, // 게시글 작성자
        attributes: ['id', 'nickname'],
      }, {
        model: User, // 좋아요 클릭한 사람
        as: 'Likers',
        attributes: ['id'],
      }]
    });
    // Return
    res.status(201).json(fullPost);
  } catch(err) {
    console.error(err);
    next(err);
  }
});

// upload.single (한장만 올릴경우엔 이렇게) .none .fields 도 있으니 찾어보길
router.post('/images', isLoggedIn, upload.array('image') , async (req, res, next) => {
  try {
    // console.log(req.files) // 저장된 파일 정보가 files 에 담김
    res.status(201).json(req.files.map((v) => v.filename));
  } catch(err) {
    console.error(err);
    next(err);
  }
});

// !!!!!!!!!!! 중요
// 아래처럼 와일드카드 패턴은 항상 아래에 놓자. 그렇지 않으면 위에 라우터와 충돌이 생길 수 있어서 404 에러가 난다.,
router.post('/:postId/comment', isLoggedIn, async (req, res, next) => {
  try {
    const post = await Post.findOne({
      where: {id: req.params.postId}
    });
    if (!post) { // 존재하지 않는 포스트라면
      return res.status(403).send('존재하지 않는 게시글입니다.');
    }

    const comment = await Comment.create({
      content: req.body.content,
      PostId: parseInt(req.params.postId, 10),
      UserId: req.body.userId,
    });
    const fullComment = await Comment.findOne({
      where: {id: comment.id},
      include: [{
        model: User,
        attributes: ['id', 'nickname'],
      }],
    });
    res.status(201).json(fullComment);
  } catch(err) {
    console.error(err);
    next(err);
  }
});

router.get('/:postId', async (req, res, next) => {
  try {
    const post = await Post.findOne({
      where: {id: req.params.postId},
    });
    if (!post) { // 존재하지 않는 포스트라면
      return res.status(404).send('존재하지 않는 게시글입니다.');
    }
    const fullPost = await Post.findOne({
      where: {id: post.id},
      include: [{
        model: Post,
        as: 'Retweet',
        include: [{
          model: User,
          attributes: ['id', 'nickname'],
        }, {
          model: Image,
        }]
      }, {
        model: User,
        attributes: ['id', 'nickname'],
      }, {
        model: Image,
      }, {
        model: Comment,
        include: [{
          model: User,
          attributes: ['id', 'nickname'],
        }],
      }, {
        model: User,
        as: 'Likers',
        attributes: ['id'],
      }]
    });
    res.status(200).json(fullPost);
  } catch(err) {
    console.error(err);
    next(err);
  }
})


router.post('/:postId/retweet', isLoggedIn, async (req, res, next) => {
  try {
    const post = await Post.findOne({
      where: {id: req.params.postId},
      include: [{
        model: Post,
        as: 'Retweet',
      }],
    });
    if (!post) { // 존재하지 않는 포스트라면
      return res.status(404).send('존재하지 않는 게시글입니다.');
    }
    // 내가 쓴 글을 리트윗 하거나 또는 내가 쓴 글을 남이 리트윗하고 그 글을 리트윗 하는경우는 막는다.
    if (req.user.id === post.UserId || (post.Retweet && post.Retweet.UserId === req.user.id)) {
      return res.status(403).send('자신의 글은 리트윗할 수 없습니다.');
    }

    const retweetTargetId = post.RetweetId || post.id;
    const exPost = await Post.findOne({
      where: {
        UserId: req.user.id,
        RetweetId: retweetTargetId,
      }
    });
    if (exPost) {
      return res.status(403).send('이미 리트윗했습니다.');
    }

    const retweet = await Post.create({
      UserId: req.user.id,
      RetweetId: retweetTargetId,
      content: 'retweet',
    });
    const retweetWithPrevPost = await Post.findOne({
      where: {id: retweet.id},
      include: [{
        model: Post,
        as: 'Retweet',
        include: [{
          model: User,
          attributes: ['id', 'nickname'],
        }, {
          model: Image,
        }]
      }, {
        model: User,
        attributes: ['id', 'nickname'],
      }, {
        model: Image,
      }, {
        model: Comment,
        include: [{
          model: User,
          attributes: ['id', 'nickname'],
        }],
      }, {
        model: User,
        as: 'Likers',
        attributes: ['id'],
      }]
    });
    res.status(201).json(retweetWithPrevPost);
  } catch(err) {
    console.error(err);
    next(err);
  }
});



// 좋아요
router.patch('/:postId/like', isLoggedIn, async (req, res, next) => {
  try {
    const post = await Post.findOne({where: {id: req.params.postId}});
    if (!post) {
      return res.status(403).send('게시글이 존재하지 않습니다.');
    }
    await post.addLikers(req.user.id);
    res.status(201).json({PostId: post.id, UserId: req.user.id});
  } catch(err) {
    console.error(err);
    next(err);
  }
});

// 좋아요 해제
router.delete('/:postId/unlike', isLoggedIn, async (req, res, next) => {
  const post = await Post.findOne({where: {id: req.params.postId}});
  if (!post) {
    return res.status(403).send('게시글이 존재하지 않습니다.');
  }
  await post.removeLikers(req.user.id);
  res.status(200).json({PostId: post.id, UserId: req.user.id});
});

router.delete('/:postId', isLoggedIn, async (req, res, next) => {
  try {
    Post.destroy({
      where: {
        id: req.params.postId,
        UserId: req.user.id,
      },
    });
    res.status(200).json({ PostId: parseInt(req.params.postId, 10) });
  } catch(err) {
    console.error(err);
    next(err);
  }
});

module.exports = router;