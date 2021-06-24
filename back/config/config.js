// 원래는 config.json 이였는데 dotenv 를 사용하려면 js 파일로 바꿔야함.
const dotenv = require('dotenv');
dotenv.config();

module.exports = {
  "development": {
    "username": "nbuser",
    "password": process.env.DB_PASSWORD,
    "database": "nodebird",
    "host": "127.0.0.1",
    "dialect": "mysql"
  },
  "test": {
    "username": "nbuser",
    "password": process.env.DB_PASSWORD,
    "database": "nodebird",
    "host": "127.0.0.1",
    "dialect": "mysql"
  },
  "production": {
    "username": "nbuser",
    "password": process.env.DB_PASSWORD,
    "database": "nodebird",
    "host": "127.0.0.1",
    "dialect": "mysql"
  }
}
