import React, { useCallback } from 'react';
import { Avatar, Button, Card } from 'antd';
import { useDispatch, useSelector } from 'react-redux';
import Link from 'next/link';
import { logoutRequestAction } from '../reducers/user';

const UserProfile = () => {
  const dispatch = useDispatch();
  const { me, logOutLoading } = useSelector((state) => state.user);

  const onClickButton = useCallback(() => {
    dispatch(logoutRequestAction());
  }, []);

  return (
    <Card
      actions={[
        <div key="twit"><Link prefetch={false} href={`/user/${me.id}`}><a>짹짹</a></Link><br />{me.Posts.length}</div>,
        <div key="followings"><Link prefetch={false} href="/profile"><a>팔로잉</a></Link><br />{me.Followings.length}</div>,
        <div key="followers"><Link prefetch={false} href="/profile"><a>팔로워</a></Link><br />{me.Followers.length}</div>,
      ]}
    >
      <Card.Meta
        avatar={<Link prefetch={false} href={`/usr/${me.id}`}><a><Avatar>{me?.nickname[0]}</Avatar></a></Link>}
        title={me?.nickname}
      />
      <Button onClick={onClickButton} loading={logOutLoading}>로그아웃</Button>
    </Card>
  );
};

export default UserProfile;
