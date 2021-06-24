// next.js 사용시에는 폴더명이 반드시 pages 이름으로 만들어야한다! 그래야 코드 스플릿팅이 된다.
// .jsx 파일이 아닌데 return 문에 jsx 파일처럼 <div> 를 React import 없이 사용 가능한 이유는 next.js 때문.
import React, { useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { END } from 'redux-saga';
import axios from 'axios';
import AppLayout from '../components/AppLayout';
import PostForm from '../components/PostForm';
import PostCard from '../components/PostCard';
import { LOAD_POSTS_REQUEST } from '../reducers/post';
import { loadMyInfoRequestAction } from '../reducers/user';
import wrapper from '../store/configureStore';

const Home = () => {
  const dispatch = useDispatch();
  const { me } = useSelector((state) => state.user);
  const { mainPosts, hasMorePosts, loadPostsLoading, retweetError } = useSelector((state) => state.post);

  // Infinity Scrolling
  useEffect(() => {
    function onScroll() {
      // console.log(window.scrollY, document.documentElement.clientHeight, document.documentElement.scrollHeight);
      // 스크롤이 끝에서 300 픽셀 남았을 경우부터
      const lastId = mainPosts[mainPosts.length - 1]?.id;
      if ((window.scrollY + document.documentElement.clientHeight) > (document.documentElement.scrollHeight - 300)) {
        // 스크롤링은 빠른시간이 수차례 실행되므로 loadPostsLoading 조건을 걸지 않으면 여러번 실행됨.
        if (hasMorePosts && !loadPostsLoading) {
          dispatch({
            type: LOAD_POSTS_REQUEST,
            lastId,
          });
        }
      }
    }
    window.addEventListener('scroll', onScroll);
    return () => {
      window.removeEventListener('scroll', onScroll);
    };
  }, [hasMorePosts, loadPostsLoading]);

  useEffect(() => {
    if (retweetError) {
      alert(retweetError);
    }
  }, [retweetError]);

  return (
    <AppLayout>
      {me && <PostForm />}
      {mainPosts.map((post) => <PostCard key={post.id} post={post} />)}
    </AppLayout>
  );
};

// Next 서버사이드 렌더링 (Home 보다 먼저 실행됨)
export const getServerSideProps = wrapper.getServerSideProps(async (context) => {
  const cookie = context.req ? context.req.headers.cookie : '';
  axios.defaults.headers.Cookie = '';
  if (context.req && cookie) { // 이렇게 하지 않으면 내가 로그인한 쿠키 정보로 다른 사람 피씨에서도 공유되는 문제가 생김
    axios.defaults.headers.Cookie = cookie;
  }

  context.store.dispatch(loadMyInfoRequestAction()); // 로그인 되어있는지 확인액션
  context.store.dispatch({ // 게시글 정보를 불러옴
    type: LOAD_POSTS_REQUEST,
  });
  // 아래 코드가 있어야 위에 Request 가 Success 될 때까지 기다려줌
  context.store.dispatch(END);
  await context.store.sagaTask.toPromise();
});

export default Home;
