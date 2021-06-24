import React, { useCallback } from 'react';
import PropTypes from 'prop-types';
import { Button } from 'antd';
import { useDispatch, useSelector } from 'react-redux';
import { FOLLOW_REQUEST, UNFOLLOW_REQUEST } from '../reducers/user';

const FollowButton = ({ post }) => {
  const dispatch = useDispatch();
  const { me, followLoading, unfollowLoading } = useSelector((state) => state.user);
  // me && me.Followings ~~ 이거를 me?.Followings 로 할 수 있음.
  const isFollowing = me?.Followings.find((v) => v.id === post.User.id);
  const onFollow = useCallback(() => {
    if (isFollowing) {
      dispatch({
        type: UNFOLLOW_REQUEST,
        data: post.User.id,
      });
    } else {
      dispatch({
        type: FOLLOW_REQUEST,
        data: post.User.id,
      });
    }
  }, [isFollowing]);

  if (post.User.id === me.id) { // 내 게시글은 팔로우 버튼이 뜨지 않음.
    return null;
  }

  return (
    <Button loading={followLoading || unfollowLoading} onClick={onFollow}>
      {isFollowing ? '언팔로우' : '팔로우'}
    </Button>
  );
};

FollowButton.propTypes = {
  post: PropTypes.shape({
    id: PropTypes.number.isRequired,
    User: PropTypes.object,
    content: PropTypes.string,
    createdAt: PropTypes.string,
    Comments: PropTypes.arrayOf(PropTypes.object), // [{},{}, ...]
    Images: PropTypes.arrayOf(PropTypes.object),
  }).isRequired,
};

export default FollowButton;
