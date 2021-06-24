import React from 'react';
import PropTypes from 'prop-types';
import Head from 'next/head';
import 'antd/dist/antd.css';
import wrapper from '../store/configureStore';

// 페이지 공통 처리
/* Component 는 pages 폴더 안에 있는 다른 js 파일들임 */
const App = ({ Component }) => (
  // next-redux-wrapper 5버전대 아래에서는 <Provider> 태그로 감싸줬는데 6버전 이후부터는 없어도 됨.
  <>
    <Head>
      <meta charSet="utf-8" />
      <title>Henry NodeBird</title>
    </Head>
    <div>공통메뉴</div>
    <Component />
  </>
);

App.propTypes = {
  Component: PropTypes.elementType.isRequired,
};

export default wrapper.withRedux(App);
