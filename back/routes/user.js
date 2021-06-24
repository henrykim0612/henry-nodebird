const express = require('express');
const bcrypt = require('bcrypt');
const {User, Post, Image, Comment} = require('../models');
const passport = require('passport');
const {Op} = require("sequelize");
const {isLoggedIn, isNotLoggedIn} = require('./middlewares');

const router = express.Router();

router.get('/', async (req, res, next) => { // 매 요청마다 호출되어 로그인 되었는지 체크함
  console.log(req.headers); // 쿠키 잘 들어오는지 확인
  try {
    if (req.user) {
      const fullUserWithoutPassword = await User.findOne({
        where: {id: req.user.id},
        // attributes: ['id', 'nickname', 'email'], // 원하는 것만 가져올 수도 있고
        attributes: {
          exclude: ['password'], // 제외도 할 수 있음
        },
        include: [{
          model: Post, // hasMany 여서 복수형이되어 me.Posts 가됨.
          attributes: ['id'], // 불필요한 데이터까지 다 가져올 필요 없음.(화면서는 숫자만 카운트 하기 때문)
        }, {
          model: User,
          as: 'Followers',
          attributes: ['id'], // 불필요한 데이터까지 다 가져올 필요 없음.(화면서는 숫자만 카운트 하기 때문)
        }, {
          model: User,
          as: 'Followings',
          attributes: ['id'], // 불필요한 데이터까지 다 가져올 필요 없음.(화면서는 숫자만 카운트 하기 때문)
        }]
      });
      res.status(200).json(fullUserWithoutPassword);
    } else {
      res.status(200).json(null);
    }
  } catch(err) {
    console.error(err);
    next(err);
  }
});

// 로그인
router.post('/login', isNotLoggedIn, (req, res, next) => {
  passport.authenticate('local', (err, user, clientErr) => {
    // done 에 대한 콜백이 여기서 실행됨.
    if (err) {
      console.error(err);
      return next(err); // status 500
    }
    if (clientErr) {
      return res.status(401).send(clientErr.reason); // 401은 허가되지 않음
    }
    return req.login(user, async (loginErr) => {
      if (loginErr) {
        console.error(loginErr);
        return next(loginErr);
      }
      // Post, Following, Follower 정보를 추가해야하므로 다시 조회해서 가공함
      const fullUserWithoutPassword = await User.findOne({
        where: {id: user.id},
        // attributes: ['id', 'nickname', 'email'], // 원하는 것만 가져올 수도 있고
        attributes: {
          exclude: ['password'], // 제외도 할 수 있음
        },
        include: [{
          model: Post, // hasMany 여서 복수형이되어 me.Posts 가됨.
          attributes: ['id'], // 불필요한 데이터까지 다 가져올 필요 없음.(화면서는 숫자만 카운트 하기 때문)
        }, {
          model: User,
          as: 'Followers',
          attributes: ['id'], // 불필요한 데이터까지 다 가져올 필요 없음.(화면서는 숫자만 카운트 하기 때문)
        }, {
          model: User,
          as: 'Followings',
          attributes: ['id'], // 불필요한 데이터까지 다 가져올 필요 없음.(화면서는 숫자만 카운트 하기 때문)
        }]
      });
      // passport 에서는 쿠키에 아이디정보를 저장하고 있음.
      return res.status(200).json(fullUserWithoutPassword);
    });
  })(req, res, next);
});

// 로그아웃
router.post('/logout', isLoggedIn, (req, res) => {
  req.logout();
  req.session.destroy();
  res.send('ok');
});

// 계정생성
router.post('/', async (req, res, next) => {
  try {
    // 이메일 체크
    const exUser = await User.findOne({
      where: {
        email: req.body.email,
      }
    });
    if (exUser) {
      return res.status(403).send('이미 사용중인 아이디입니다.');
    }

    const hashedPassword = await bcrypt.hash(req.body.password, 12); // salt 는 높을수록 암호가 강해지는데 시간이 오래걸림
    await User.create({
      email: req.body.email,
      nickname: req.body.nickname,
      password: hashedPassword,
    });
    res.status(201).send('ok'); // 201 은 잘 생성됨
  } catch (err) {
    console.error(err);
    next(err); // status 500
  }
});

// 닉네임 수정
router.patch('/nickname', isLoggedIn, async (req, res, next) => {
  try {
    User.update({
      nickname: req.body.nickname,
    }, {
      where: {id: req.user.id},
    });
    res.status(200).json({nickname: req.body.nickname});
  } catch(err) {
    console.error(err);
    next(err);
  }
});

router.get('/followers', isLoggedIn, async (req, res, next) => {
  try {
    const user = await User.findOne({where: {id: req.user.id}});
    const followers = await user.getFollowers({
      limit: parseInt(req.query.limit, 10),
    });
    res.status(200).json(followers);
  } catch(err) {
    console.error(err);
    next(err);
  }
});

router.get('/followings', isLoggedIn, async (req, res, next) => {
  try {
    const user = await User.findOne({where: {id: req.user.id}});
    const followings = await user.getFollowings({
      limit: parseInt(req.query.limit, 10),
    });
    res.status(200).json(followings);
  } catch(err) {
    console.error(err);
    next(err);
  }
});


// !!!!!!!!!!! 중요
// 아래처럼 와일드카드 패턴은 항상 아래에 놓자. 그렇지 않으면 위에 라우터와 충돌이 생길 수 있어서 404 에러가 난다.,
router.get('/:userId', async (req, res, next) => { // 매 요청마다 호출되어 로그인 되었는지 체크함
  try {
    const fullUserWithoutPassword = await User.findOne({
      where: {id: req.params.userId},
      // attributes: ['id', 'nickname', 'email'], // 원하는 것만 가져올 수도 있고
      attributes: {
        exclude: ['password'], // 제외도 할 수 있음
      },
      include: [{
        model: Post, // hasMany 여서 복수형이되어 me.Posts 가됨.
        attributes: ['id'], // 불필요한 데이터까지 다 가져올 필요 없음.(화면서는 숫자만 카운트 하기 때문)
      }, {
        model: User,
        as: 'Followers',
        attributes: ['id'], // 불필요한 데이터까지 다 가져올 필요 없음.(화면서는 숫자만 카운트 하기 때문)
      }, {
        model: User,
        as: 'Followings',
        attributes: ['id'], // 불필요한 데이터까지 다 가져올 필요 없음.(화면서는 숫자만 카운트 하기 때문)
      }]
    });
    if (fullUserWithoutPassword) {
      const data = fullUserWithoutPassword.toJSON(); // Sequelize 반환값은 제이슨이 아니므로 변환 해야함.
      // 남의 정보니까 보안을 위해서 개수만 표시하도록 변경
      data.Posts = data.Posts.length;
      data.Followings = data.Followings.length;
      data.Followers = data.Followers.length;
      res.status(200).json(data);
    } else {
      res.status(404).json('존재하지 않는 사용자입니다.');
    }
  } catch(err) {
    console.error(err);
    next(err);
  }
});

// 팔로우
router.patch('/:userId/follow', isLoggedIn, async (req, res, next) => {
  try {
    const user = await User.findOne({
      where: {id: req.params.userId},
    });
    if (!user) {
      return res.status(403).send('없는 사람을 팔로우 할 수 없습니다.');
    }
    await user.addFollowers(req.user.id);
    res.status(200).json({ UserId: parseInt(req.params.userId, 10) });
  } catch(err) {
    console.error(err);
    next(err);
  }
});

// 언팔로우
router.delete('/:userId/follow', isLoggedIn, async (req, res, next) => {
  try {
    const user = await User.findOne({
      where: {id: req.params.userId},
    });
    if (!user) {
      return res.status(403).send('없는 사람을 언팔로우 할 수 없습니다.');
    }
    await user.removeFollowers(req.user.id);
    res.status(200).json({ UserId: parseInt(req.params.userId, 10) });
  } catch(err) {
    console.error(err);
    next(err);
  }
});

router.delete('/follower/:userId', isLoggedIn, async (req, res, next) => {
  try {
    const user = await User.findOne({
      where: {id: req.params.userId},
    });
    if (!user) {
      return res.status(403).send('없는 사람을 차단할 수 없습니다.');
    }
    await user.removeFollowers(req.user.id);
    res.status(200).json({UserId: parseInt(req.params.userId, 10)});
  } catch(err) {
    console.error(err);
    next(err);
  }
});


router.get('/:userId/posts', async (req, res, next) => {
  try {
    let where = {
      UserId: req.params.userId,
    };
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