import { all, delay, fork, put, takeLatest, throttle, call } from 'redux-saga/effects';
import axios from 'axios';
import shortId from 'shortid';
import {
  ADD_COMMENT_FAILURE,
  ADD_COMMENT_REQUEST,
  ADD_COMMENT_SUCCESS,
  ADD_POST_FAILURE,
  ADD_POST_REQUEST,
  ADD_POST_SUCCESS,
  generateDummyPost,
  LIKE_POST_FAILURE,
  LIKE_POST_REQUEST,
  LIKE_POST_SUCCESS,
  LOAD_HASHTAG_POSTS_FAILURE, LOAD_HASHTAG_POSTS_REQUEST,
  LOAD_HASHTAG_POSTS_SUCCESS,
  LOAD_POST_FAILURE,
  LOAD_POST_REQUEST,
  LOAD_POST_SUCCESS,
  LOAD_POSTS_FAILURE,
  LOAD_POSTS_REQUEST,
  LOAD_POSTS_SUCCESS,
  LOAD_USER_POSTS_FAILURE,
  LOAD_USER_POSTS_REQUEST,
  LOAD_USER_POSTS_SUCCESS,
  REMOVE_POST_FAILURE,
  REMOVE_POST_REQUEST,
  REMOVE_POST_SUCCESS,
  RETWEET_FAILURE,
  RETWEET_REQUEST,
  RETWEET_SUCCESS,
  UNLIKE_POST_FAILURE,
  UNLIKE_POST_REQUEST,
  UNLIKE_POST_SUCCESS,
  UPLOAD_IMAGES_FAILURE,
  UPLOAD_IMAGES_REQUEST,
  UPLOAD_IMAGES_SUCCESS,
} from '../reducers/post';
import {
  ADD_POST_TO_ME,
  FOLLOW_FAILURE,
  FOLLOW_REQUEST,
  FOLLOW_SUCCESS,
  REMOVE_POST_OF_ME, UNFOLLOW_FAILURE,
  UNFOLLOW_REQUEST, UNFOLLOW_SUCCESS,
} from '../reducers/user';

// Load posts
function loadPostsAPI(lastId) {
  return axios.get(`/posts?lastId=${lastId || 0}`);
}
function* loadPosts(action) {
  try {
    const result = yield call(loadPostsAPI, action.lastId);
    yield put({
      type: LOAD_POSTS_SUCCESS,
      // data: generateDummyPost(10),
      data: result.data,
    });
  } catch (err) {
    console.error(err);
    yield put({ // PUT 은 Dispatch 라고 생각하면됨
      type: LOAD_POSTS_FAILURE,
      error: err.response.data,
    });
  }
}
function* watchLoadPosts() {
  // 스크롤링은 짧은시간에 여러번 일어 나므로 throttle 로 5초안에 이벤트를 하나로 막는다.
  yield throttle(5000, LOAD_POSTS_REQUEST, loadPosts);
}

// Load user posts
function loadUserPostsAPI(data, lastId) {
  return axios.get(`/user/${data}/posts?lastId=${lastId || 0}`);
}
function* loadUserPosts(action) {
  try {
    const result = yield call(loadUserPostsAPI, action.data, action.lastId);
    yield put({
      type: LOAD_USER_POSTS_SUCCESS,
      // data: generateDummyPost(10),
      data: result.data,
    });
  } catch (err) {
    console.error(err);
    yield put({ // PUT 은 Dispatch 라고 생각하면됨
      type: LOAD_USER_POSTS_FAILURE,
      error: err.response.data,
    });
  }
}
function* watchLoadUserPosts() {
  // 스크롤링은 짧은시간에 여러번 일어 나므로 throttle 로 5초안에 이벤트를 하나로 막는다.
  yield throttle(5000, LOAD_USER_POSTS_REQUEST, loadUserPosts);
}

// Load Hashtag posts
function loadHashtagUserPostsAPI(data, lastId) {
  return axios.get(`/hashtag/${encodeURIComponent(data)}?lastId=${lastId || 0}`);
}
function* loadHashtagUserPosts(action) {
  try {
    const result = yield call(loadHashtagUserPostsAPI, action.data, action.lastId);
    yield put({
      type: LOAD_HASHTAG_POSTS_SUCCESS,
      // data: generateDummyPost(10),
      data: result.data,
    });
  } catch (err) {
    console.error(err);
    yield put({ // PUT 은 Dispatch 라고 생각하면됨
      type: LOAD_HASHTAG_POSTS_FAILURE,
      error: err.response.data,
    });
  }
}
function* watchLoadHashtagPosts() {
  // 스크롤링은 짧은시간에 여러번 일어 나므로 throttle 로 5초안에 이벤트를 하나로 막는다.
  yield throttle(5000, LOAD_HASHTAG_POSTS_REQUEST, loadHashtagUserPosts);
}

// Load post
function loadPostAPI(data) {
  return axios.get(`/post/${data}`);
}
function* loadPost(action) {
  try {
    const result = yield call(loadPostAPI, action.data);
    yield put({
      type: LOAD_POST_SUCCESS,
      // data: generateDummyPost(10),
      data: result.data,
    });
  } catch (err) {
    console.error(err);
    yield put({ // PUT 은 Dispatch 라고 생각하면됨
      type: LOAD_POST_FAILURE,
      error: err.response.data,
    });
  }
}
function* watchLoadPost() {
  // 스크롤링은 짧은시간에 여러번 일어 나므로 throttle 로 5초안에 이벤트를 하나로 막는다.
  yield takeLatest(LOAD_POST_REQUEST, loadPost);
}

// Add post
function addPostAPI(data) {
  return axios.post('/post', data);
}
function* addPost(action) {
  try {
    const result = yield call(addPostAPI, action.data);
    yield put({
      type: ADD_POST_SUCCESS,
      data: result.data,
    });
    yield put({
      type: ADD_POST_TO_ME,
      data: result.data.id,
    });
  } catch (err) {
    console.error(err);
    yield put({ // PUT 은 Dispatch 라고 생각하면됨
      type: ADD_POST_FAILURE,
      error: err.response.data,
    });
  }
}
function* watchAddPost() {
  // takeLatest 는 Front 에서만 필터링 해주는 것이므로 서버에서도 필터링 해줘야한다. 그렇지 않으면 두번을 호출했을때 호출 하나만 취소될 뿐 저장은 두번됨
  yield takeLatest(ADD_POST_REQUEST, addPost);
}

// Remove post
function removePostAPI(data) {
  return axios.delete(`/post/${data}`);
}
function* removePost(action) {
  try {
    const result = yield call(removePostAPI, action.data);
    yield put({
      type: REMOVE_POST_SUCCESS,
      data: result.data,
    });
    yield put({
      type: REMOVE_POST_OF_ME,
      data: action.data,
    });
  } catch (err) {
    console.error(err);
    yield put({ // PUT 은 Dispatch 라고 생각하면됨
      type: REMOVE_POST_FAILURE,
      error: err.response.data,
    });
  }
}
function* watchRemovePost() {
  // takeLatest 는 Front 에서만 필터링 해주는 것이므로 서버에서도 필터링 해줘야한다. 그렇지 않으면 두번을 호출했을때 호출 하나만 취소될 뿐 저장은 두번됨
  yield takeLatest(REMOVE_POST_REQUEST, removePost);
}

// Add comment
function addCommentAPI(data) {
  // { content: commentText, postId: post.id, userId: id }
  return axios.post(`/post/${data.postId}/comment`, data);
}
function* addComment(action) {
  try {
    const result = yield call(addCommentAPI, action.data);
    yield put({
      type: ADD_COMMENT_SUCCESS,
      data: result.data,
    });
  } catch (err) {
    console.error(err);
    yield put({ // PUT 은 Dispatch 라고 생각하면됨
      type: ADD_COMMENT_FAILURE,
      error: err.response.data,
    });
  }
}
function* watchAddComment() {
  // takeLatest 는 Front 에서만 필터링 해주는 것이므로 서버에서도 필터링 해줘야한다. 그렇지 않으면 두번을 호출했을때 호출 하나만 취소될 뿐 저장은 두번됨
  yield takeLatest(ADD_COMMENT_REQUEST, addComment);
}

// follow
function followAPI(data) {
  return axios.patch(`/user/${data}/follow`);
}
function* follow(action) {
  try {
    const result = yield call(followAPI, action.data);
    yield put({
      type: FOLLOW_SUCCESS,
      data: result.data,
    });
  } catch (err) {
    console.error(err);
    yield put({ // PUT 은 Dispatch 라고 생각하면됨
      type: FOLLOW_FAILURE,
      error: err.response.data,
    });
  }
}
function* watchFollow() {
  // takeLatest 는 Front 에서만 필터링 해주는 것이므로 서버에서도 필터링 해줘야한다. 그렇지 않으면 두번을 호출했을때 호출 하나만 취소될 뿐 저장은 두번됨
  yield takeLatest(FOLLOW_REQUEST, follow);
}

// unfollow
function unfollowAPI(data) {
  return axios.delete(`/user/${data}/follow`);
}
function* unfollow(action) {
  try {
    const result = yield call(unfollowAPI, action.data);
    yield put({
      type: UNFOLLOW_SUCCESS,
      data: result.data,
    });
  } catch (err) {
    console.error(err);
    yield put({ // PUT 은 Dispatch 라고 생각하면됨
      type: UNFOLLOW_FAILURE,
      error: err.response.data,
    });
  }
}
function* watchUnfollow() {
  // takeLatest 는 Front 에서만 필터링 해주는 것이므로 서버에서도 필터링 해줘야한다. 그렇지 않으면 두번을 호출했을때 호출 하나만 취소될 뿐 저장은 두번됨
  yield takeLatest(UNFOLLOW_REQUEST, unfollow);
}

function likePostAPI(data) {
  return axios.patch(`/post/${data}/like`);
}
function* likePost(action) {
  try {
    const result = yield call(likePostAPI, action.data);
    yield put({
      type: LIKE_POST_SUCCESS,
      data: result.data,
    });
  } catch (err) {
    console.error(err);
    yield put({ // PUT 은 Dispatch 라고 생각하면됨
      type: LIKE_POST_FAILURE,
      error: err.response.data,
    });
  }
}
function* watchLikePost() {
  yield takeLatest(LIKE_POST_REQUEST, likePost);
}

function unlikePostAPI(data) {
  return axios.delete(`/post/${data}/unlike`);
}
function* unlikePost(action) {
  try {
    const result = yield call(unlikePostAPI, action.data);
    yield put({
      type: UNLIKE_POST_SUCCESS,
      data: result.data,
    });
  } catch (err) {
    console.error(err);
    yield put({ // PUT 은 Dispatch 라고 생각하면됨
      type: UNLIKE_POST_FAILURE,
      error: err.response.data,
    });
  }
}
function* watchUnlikePost() {
  yield takeLatest(UNLIKE_POST_REQUEST, unlikePost);
}

// Upload images
function uploadImagesAPI(data) {
  return axios.post('/post/images', data);
}
function* uploadImages(action) {
  try {
    const result = yield call(uploadImagesAPI, action.data);
    yield put({
      type: UPLOAD_IMAGES_SUCCESS,
      data: result.data,
    });
  } catch (err) {
    console.error(err);
    yield put({
      type: UPLOAD_IMAGES_FAILURE,
      error: err.response.data,
    });
  }
}
function* watchUploadImages() {
  yield takeLatest(UPLOAD_IMAGES_REQUEST, uploadImages);
}

// Retweet
function retweetAPI(data) {
  return axios.post(`/post/${data}/retweet`);
}
function* retweet(action) {
  try {
    const result = yield call(retweetAPI, action.data);
    yield put({
      type: RETWEET_SUCCESS,
      data: result.data,
    });
  } catch (err) {
    console.error(err);
    yield put({
      type: RETWEET_FAILURE,
      error: err.response.data,
    });
  }
}
function* watchRetweet() {
  yield takeLatest(RETWEET_REQUEST, retweet);
}

export default function* postSaga() {
  yield all([
    fork(watchLoadPosts),
    fork(watchLoadUserPosts),
    fork(watchLoadHashtagPosts),
    fork(watchLoadPost),
    fork(watchAddPost),
    fork(watchRemovePost),
    fork(watchAddComment),
    fork(watchFollow),
    fork(watchUnfollow),
    fork(watchLikePost),
    fork(watchUnlikePost),
    fork(watchUploadImages),
    fork(watchRetweet),
  ]);
}
