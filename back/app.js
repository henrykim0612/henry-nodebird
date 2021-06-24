const express = require('express');
const postRouter = require('./routes/post');
const userRouter = require('./routes/user');
const postsRouter = require('./routes/posts');
const hashtagRouter = require('./routes/hashtag');
const db = require('./models');
const cors = require('cors');
const passportConfig = require('./passport');
const session = require('express-session');
const cookieParser = require('cookie-parser');
const passport = require('passport');
const dotenv = require('dotenv');
const morgan = require('morgan');
const path = require('path');
const hpp = require('hpp');
const helmet = require('helmet');

dotenv.config();
const app = express();
// npx sequelize db:create  구문으로 DB를 생성할 수 있음.
db.sequelize.sync()
  .then(() => {
    console.log('Connection Success !!');
  })
  .catch(console.error);

passportConfig();

if (process.env.NODE_ENV === 'production') {
  app.set('trust proxy', 1); // Nginx 를 사용할 경우에는 이 설정이 필요함. 없으면 https 에서 Secure 설정에 문제가 생김.
  app.use(morgan('combined'));
  app.use(hpp());
  app.use(helmet());
  app.use(cors({
    origin: 'http://nodebird.com', // Access-Control-Allow-Origin response header 에 추가하여 다른 도메인간 호출을 허용
    // origin: 'https://nodebird.com' // 원래는 이렇게 특정 경로만 허용하도록 해야하지만 지금은 스터디니까 '*' 로.
    credentials: true, // 기본값은 false 인데 true로 해주는 이유는 이렇게 하지 않으면 다른 도메인간에 쿠키전달이 되지않음(원래 브라우저 정책상 안됨). Access-Control-Allow-Credentials 헤더 추가됨
  }));
} else {
  app.use(morgan('dev'));
  app.use(cors({
    origin: true, // Access-Control-Allow-Origin response header 에 추가하여 다른 도메인간 호출을 허용
    credentials: true, // 기본값은 false 인데 true로 해주는 이유는 이렇게 하지 않으면 다른 도메인간에 쿠키전달이 되지않음(원래 브라우저 정책상 안됨). Access-Control-Allow-Credentials 헤더 추가됨
  }));
}

app.use('/images', express.static(path.join(__dirname, 'uploads')));
app.use(express.json()); // json 형식
app.use(express.urlencoded({extended: true})); // form submit
/*passport 관련설정*/
app.use(cookieParser(process.env.COOKIE_SECRET));
// https 적용시에는 아래 session 설정을 바꿔줘야함
app.use(session({
  saveUninitialized: false,
  resave: false,
  secret: process.env.COOKIE_SECRET,
  // proxy: true, // Nginx 적용시 주석해제. Nginx 설정도 바꿔줘야함.
  // cookie: { // 같은 도메인간 쿠기를 공유하기 위한 설정
  //   httpOnly: true,
  //   secure: false, // https 적용하면 true
  //   domain: process.env.NODE_ENV === 'production' && '.nodebird.com'
  // },
}));
app.use(passport.initialize());
app.use(passport.session());

app.use('/post', postRouter);
app.use('/posts', postsRouter);
app.use('/user', userRouter);
app.use('/hashtag', hashtagRouter);

// 에러처리 미들웨어를 추가히면 기본을 쓰는게 아니라 Override 됨. 기본내장되어있지만 에러페이지를 띄우고 싶다던가 할때 이렇게 추가해서 많이 씀.
// app.use((err, req, res, next) => {
// });


app.listen(3065, () => {
  console.log('Running 3065 port.....');
});