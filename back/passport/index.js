const passport = require('passport');
const local = require('./local');
const { User } = require('../models');

module.exports = () => {
  passport.serializeUser((user, done) => {
    // 세션에 저장하기에는 너무 무거우므로 아이디만 저장함
    done(null, user.id);
  });
  // 로그인이 된 이후 그 다음 오청부터 계속 사용자 정보를 복구함
  passport.deserializeUser(async (id, done) => {
    // 아이디만 저장했으니 아이디로 사용자를 찾어서 복구
    try {
      const user = await User.findOne({where: { id }});
      done(null, user); // req.user 에 넣어줌
    } catch (err) {
      console.error(err);
      done(err);
    }
  });
  local();
};