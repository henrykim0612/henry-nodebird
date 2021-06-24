import React, { useCallback, useEffect } from 'react';
import { Button, Form, Input } from 'antd';
import Link from 'next/link';
import styled from 'styled-components';
import { useDispatch, useSelector } from 'react-redux';
import useInput from '../hooks/useInput';
import { loginRequestAction } from '../reducers/user';

const StyledButton = styled.div`
  margin-top: 10px;
`;

const StyledForm = styled(Form)`
  padding: 10px;
`;

const LoginForm = () => {
  const dispatch = useDispatch();

  const { logInLoading, logInError } = useSelector((state) => state.user);
  const [email, onChangeUserEmail] = useInput('');
  const [password, onChangeUserPassword] = useInput('');

  const onFinishForm = useCallback(() => {
    dispatch(loginRequestAction({ email, password }));
  }, [email, password]);

  // 로그인 에러시 출력
  useEffect(() => {
    if (logInError) {
      alert(logInError);
    }
  }, [logInError]);

  return (
    <StyledForm onFinish={onFinishForm}>
      <div>
        <label htmlFor="user-email">이메일</label>
        <br />
        <Input type="email" name="user-email" value={email} onChange={onChangeUserEmail} required />
      </div>
      <div>
        <label htmlFor="user-password">패스워드</label>
        <br />
        <Input type="password" name="user-password" value={password} onChange={onChangeUserPassword} required />
      </div>
      <StyledButton>
        <Button type="primary" htmlType="submit" loading={logInLoading}>로그인</Button>
        <Link href="/signup"><a><Button>회원가입</Button></a></Link>
      </StyledButton>
    </StyledForm>
  );
};

export default LoginForm;
