// 로그인 전략
const passport = require('passport');
const {Strategy: LocalStrategy} = require('passport-local');
const { User } = require('../models');
const bcrypt = require('bcrypt');

module.exports = () => {
  passport.use(new LocalStrategy({
    usernameField: 'email', // 넘어오는 파라미터명이랑 같아야함(req.body.email)
    passwordField: 'password', // 넘어오는 파라미터명이랑 같아야함(req.body.password)
  }, async (email, password, done) => {
    // (email, password, done) 의 email 과 password 는 위에 usernameField, passwordField 와 같아야함
    // 로그인 전략을 여기에 세우면 됨
    try {
      const user = await User.findOne({
        where: { email }
      });
      if (!user) {
        return done(null, false, { reason: '존재하지 않는 사용자입니다.' });
      }

      const result = await bcrypt.compare(password, user.password);
      if (result) {
        return done(null, user);
      }

      return done(null, false, { reason: '비밀번호가 틀렸습니다.' });

    } catch(err) {
      console.error(err);
      return done(err);
    }
  }));
};