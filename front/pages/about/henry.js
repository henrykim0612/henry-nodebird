import React from 'react';
import Head from 'next/head';
import { useSelector } from 'react-redux';
import { END } from 'redux-saga';
import AppLayout from '../../components/AppLayout';
import { LOAD_USER_REQUEST } from '../../reducers/user';
import wrapper from '../../store/configureStore';

const Henry = () => {
  const { userInfo } = useSelector((state) => state.user);

  // if (router.isFallback) {
  //   return <div>Loading...</div>;
  // }

  return (
    <>
      <Head>
        <meta charSet="utf-8" />
        <title>소개 | Henry's NodeBird</title>
      </Head>
      {userInfo
        ? (
          <AppLayout>
            <div>짹쨱: {userInfo.Posts}</div>
            <div>팔로잉: {userInfo.Followings}</div>
            <div>팔로어: {userInfo.Followers}</div>
          </AppLayout>
        )
        : null}
    </>
  );
};

/* !!! 중요 getStaticPaths 은 dynamic page 에서만 사용 가능하다 (그래서 지금 henry.js 이 페이지에서는 쓸 수 없음)
// getStaticPaths 은 getStaticProps 와 함께 쓰이며 아래처럼 미리 1, 2, 3을 조회하여 세장의 html 을 만들어 놓을 수 있다,
export async function getStaticPaths() {
  return {
    paths: [
      { params: { id: 1 } },
      { params: { id: 2 } },
      { params: { id: 3 } },
    ],
    fallback: false, // 이게 true 면 위에 코드쪽에 fallback 관련 로딩 처리를 할 수 있음. false 면 에러를 뱉어냄.
  };
}

// 언제 접속해도 데이터가 바뀔일이 없으면 getStaticProps 를 사용한다. (나중에 배포할때는 Next 에서 아예 정적인 HTML 로 미리 뽑아서 렌더링함. 근데 사실상 거의 쓰이지가 않음.. 바뀔일이 없는 화면이 거의 없으므로..)
// !!! 주의: getStaticProps는 DB에 데이터가 있어야만 쓸 수 있다..
export const getStaticProps = wrapper.getStaticProps(async (context) => {
  context.store.dispatch({
    type: LOAD_USER_REQUEST,
    data: 1,
  });
  context.store.dispatch(END);
  await context.store.sagaTask.toPromise();
});
*/

export default Henry;
