import { all, fork } from 'redux-saga/effects';
import axios from 'axios';
import userSaga from './user';
import postSaga from './post';
import { baseUrl } from '../config/config';

axios.defaults.baseURL = baseUrl;
axios.defaults.withCredentials = true; // 이걸 넣어주지 않으면 다른 도메인간에 쿠키전달이 되지 않아 로그인 유지가 않됨.

// All
export default function* rootSaga() {
  yield all([
    fork(userSaga),
    fork(postSaga),
  ]);
}
