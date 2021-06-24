import React, { useCallback, useEffect, useState } from 'react';
import Head from 'next/head';
import { useSelector } from 'react-redux';
import { useRouter } from 'next/router';
import axios from 'axios';
import { END } from 'redux-saga';
import useSWR from 'swr';
import AppLayout from '../components/AppLayout';
import NicknameEditForm from '../components/NicknameEditForm';
import FollowList from '../components/FollowList';
import { LOAD_MY_INFO_REQUEST } from '../reducers/user';
import wrapper from '../store/configureStore';
import { baseUrl } from '../config/config';

/**
 *
 * 이 페이지 에서는 SWR 이라는것을 사용하는데, 리듀서에 액션이 너무 많아지다 보니까 적어도 Get 요청 정도는 간편하게 호출해서 쓸 쑤 있는게 SWR 임.
 *
 */

const fetcher = (url) => axios.get(url, { withCredentials: true }).then((result) => result.data);

const Profile = () => {
  const { me } = useSelector((state) => state.user);
  const [followersLimit, setFollowersLimit] = useState(3);
  const [followingsLimit, setFollowingsLimit] = useState(3);

  // data, error 데이터 두개가 다 없으면 로딩중, 둘 중 하나라도 있으면 성공 또는 에러
  const { data: followersData, error: followerError } = useSWR(`${baseUrl}/user/followers?limit=${followersLimit}`, fetcher);
  const { data: followingsData, error: followingError } = useSWR(`${baseUrl}/user/followings?limit=${followingsLimit}`, fetcher);

  // const dispatch = useDispatch();
  const router = useRouter();

  const loadMoreFollowers = useCallback(() => {
    setFollowersLimit((prev) => prev + 3);
  }, []);

  const loadMoreFollowings = useCallback(() => {
    setFollowingsLimit((prev) => prev + 3);
  }, []);

  useEffect(() => {
    if (!(me && me.id)) {
      router.push('/'); // 리다이렉트
    }
  }, [me && me.id]);

  // useEffect(() => {
  //   dispatch({
  //     type: LOAD_FOLLOWERS_REQUEST,
  //   });
  //   dispatch({
  //     type: LOAD_FOLLOWINGS_REQUEST,
  //   });
  // }, []);

  // !!!!!!!!!!!!!! 중요
  // 어떤 경우에서든 훅스(useXXX)보다 리턴이 먼저 있으면 안된다.
  if (!me) {
    return '내 정보 로딩중...';
  }

  if (followerError || followingError) {
    console.error(followerError || followingError);
    return '팔로워/팔로잉 로딩중 에러가 발생했습니다.';
  }

  return (
    <AppLayout>
      <Head>
        <meta charSet="utf-8" />
        <title>내 프로필 | Henry NodeBird</title>
      </Head>
      <NicknameEditForm />
      <FollowList header="팔로잉" data={followingsData} onClickMore={loadMoreFollowings} loading={!followingsData && !followingError} />
      <FollowList header="팔로워" data={followersData} onClickMore={loadMoreFollowers} loading={!followersData && !followerError} />
    </AppLayout>
  );
};

export const getServerSideProps = wrapper.getServerSideProps(async (context) => {
  console.log('getServerSideProps start');
  console.log(context.req.headers);
  const cookie = context.req ? context.req.headers.cookie : '';
  axios.defaults.headers.Cookie = '';
  if (context.req && cookie) {
    axios.defaults.headers.Cookie = cookie;
  }
  context.store.dispatch({
    type: LOAD_MY_INFO_REQUEST,
  });
  context.store.dispatch(END);
  console.log('getServerSideProps end');
  await context.store.sagaTask.toPromise();
});

export default Profile;
