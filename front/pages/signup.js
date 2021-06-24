import React, { useCallback, useState, useMemo, useEffect } from 'react';
import Head from 'next/head';
import { Button, Checkbox, Form, Input } from 'antd';
import styled from 'styled-components';
import { useDispatch, useSelector } from 'react-redux';
import { useRouter } from 'next/router';
import axios from 'axios';
import { END } from 'redux-saga';
import useInput from '../hooks/useInput';
import { LOAD_MY_INFO_REQUEST, SIGN_UP_REQUEST } from '../reducers/user';
import AppLayout from '../components/AppLayout';
import wrapper from '../store/configureStore';

const ErrorMessage = styled.div`
  color: red;
`;

const Signup = () => {
  const dispatch = useDispatch();
  const router = useRouter();
  const { signUpLoading, signUpError, me } = useSelector((state) => state.user);

  const marginTop10 = useMemo(() => ({ marginTop: 10 }), []);

  const [email, onChangeEmail] = useInput('');
  const [nickname, onChangeNickname] = useInput('');
  const [password, onChangePassword] = useInput('');

  const [passwordCheck, setPasswordCheck] = useState('');
  const [passwordError, setPasswordError] = useState(false);
  const onChangePasswordCheck = useCallback((e) => {
    const { value } = e.target;
    setPasswordCheck(value);
    setPasswordError(value !== password);
  }, [password]);

  const [term, setTerm] = useState(false);
  const [termError, setTermError] = useState(false);
  const onChangeTerm = useCallback((e) => {
    const { checked } = e.target;
    setTerm(checked);
    setTermError(false);
  }, []);

  const onSubmit = useCallback(() => {
    if (password !== passwordCheck) {
      return setPasswordError(true);
    }
    if (!term) {
      return setTermError(true);
    }
    console.log(email, nickname, password);
    return dispatch({
      type: SIGN_UP_REQUEST,
      data: { email, password, nickname },
    });
  }, [email, password, passwordCheck, term]);

  // 회원가입 실패
  useEffect(() => {
    if (signUpError) {
      alert(signUpError);
    }
  }, [signUpError]);

  // 로그인 되었다면 포워딩
  useEffect(() => {
    if (me && me.id) {
      router.replace('/'); // 뒤로가기 했을때 이력을 없애버리고 싶으면 replace
    }
  }, [me && me.id]);

  return (
    <>
      <AppLayout>
        <Head>
          <meta charSet="utf-8" />
          <title>회원가입 | Henry NodeBird</title>
        </Head>
        <Form onFinish={onSubmit}>
          <div>
            <label htmlFor="user-email">Email</label>
            <br />
            <Input name="user-email" value={email} type="email" required onChange={onChangeEmail} />
          </div>
          <div>
            <label htmlFor="user-nick">Nickname</label>
            <br />
            <Input name="user-nick" value={nickname} required onChange={onChangeNickname} />
          </div>
          <div>
            <label htmlFor="user-password">PWD</label>
            <br />
            <Input name="user-password" value={password} type="password" required onChange={onChangePassword} />
          </div>
          <div>
            <label htmlFor="user-password-check">PWD Again</label>
            <br />
            <Input
              name="user-password-check"
              type="password"
              value={passwordCheck}
              required
              onChange={onChangePasswordCheck}
            />
            {passwordError && <ErrorMessage>비밀번호가 일치하지 않습니다.</ErrorMessage>}
          </div>
          <div>
            <Checkbox name="user-term" checked={term} onChange={onChangeTerm}>회원가입을 동의합니다.</Checkbox>
            {termError && <ErrorMessage>약관에 동의하셔야 합니다.</ErrorMessage>}
          </div>
          <div style={marginTop10}>
            <Button type="primary" htmlType="submit" loading={signUpLoading}>가입하기</Button>
          </div>
        </Form>
      </AppLayout>
    </>
  );
};

// Next 서버사이드 렌더링 (Home 보다 먼저 실행됨)
export const getServerSideProps = wrapper.getServerSideProps(async (context) => {
  const cookie = context.req ? context.req.headers.cookie : '';
  axios.defaults.headers.Cookie = '';
  if (context.req && cookie) { // 이렇게 하지 않으면 내가 로그인한 쿠키 정보로 다른 사람 피씨에서도 공유되는 문제가 생김
    axios.defaults.headers.Cookie = cookie;
  }
  context.store.dispatch({
    type: LOAD_MY_INFO_REQUEST,
  });
  // 아래 코드가 있어야 위에 Request 가 Success 될 때까지 기다려줌
  context.store.dispatch(END);
  await context.store.sagaTask.toPromise();
});

export default Signup;
