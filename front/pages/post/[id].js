// Next 의 다이나믹 라우팅 기능
import React from 'react';
import { useRouter } from 'next/router';
import axios from 'axios';
import { END } from 'redux-saga';
import { useSelector } from 'react-redux';
import Head from 'next/head';
import wrapper from '../../store/configureStore';
import { loadMyInfoRequestAction } from '../../reducers/user';
import { LOAD_POST_REQUEST } from '../../reducers/post';
import AppLayout from '../../components/AppLayout';
import PostCard from '../../components/PostCard';

const Post = () => {
  const router = useRouter();
  const { singlePost } = useSelector((state) => state.post);
  const { id } = router.query;
  return (
    <AppLayout>
      <Head>
        <title>
          {singlePost.User.nickname}님의 게시글
        </title>
        <meta name="description" content={singlePost.content} />
        <meta property="og:title" content={`${singlePost.User.nickname}님의 게시글`} />
        <meta property="og:description" content={singlePost.content} />
        <meta property="og:image" content={singlePost.Images[0] ? singlePost.Images[0].src : 'https://nodebird.com/favicon.ico'} />
        <meta property="og:url" content={`https://nodebird.com/post/${id}`} />
      </Head>
      <div>{id}번 게시글</div>
      <PostCard post={singlePost} />
    </AppLayout>
  );
};

export const getServerSideProps = wrapper.getServerSideProps(async (context) => {
  const cookie = context.req ? context.req.headers.cookie : '';
  axios.defaults.headers.Cookie = '';
  if (context.req && cookie) { // 이렇게 하지 않으면 내가 로그인한 쿠키 정보로 다른 사람 피씨에서도 공유되는 문제가 생김
    axios.defaults.headers.Cookie = cookie;
  }
  context.store.dispatch(loadMyInfoRequestAction()); // 로그인 되어있는지 확인액션
  context.store.dispatch({
    type: LOAD_POST_REQUEST,
    data: context.params.id, // getServerSideProps, getStaticProps 에서는 context.params || context.query 가 위의 router.query 랑 동일하기 때문에 값을 가져올 수 있음
  });
  // 아래 코드가 있어야 위에 Request 가 Success 될 때까지 기다려줌
  context.store.dispatch(END);
  await context.store.sagaTask.toPromise();
});

export default Post;
