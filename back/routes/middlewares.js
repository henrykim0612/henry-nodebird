// Middleware 를 만들 수 있음
exports.isLoggedIn = (req, res, next) => {
  if (req.isAuthenticated()) { // passport 에서 req.isAuthenticated() 지원해줌.
    next();
  } else {
    res.status(401).send('로그인이 필요합니다.');
  }
}

exports.isNotLoggedIn = (req, res, next) => {
  if (!req.isAuthenticated()) { // passport 에서 req.isAuthenticated() 지원해줌.
    next();
  } else {
    res.status(401).send('로그인하지 않은 사용자만 접근 가능합니다.');
  }
}