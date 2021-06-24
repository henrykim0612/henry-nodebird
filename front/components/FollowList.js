import React, { useCallback, useMemo } from 'react';
import PropTypes from 'prop-types';
import { Button, Card, List } from 'antd';
import { StopOutlined } from '@ant-design/icons';
import { useDispatch } from 'react-redux';
import { REMOVE_FOLLOWER_REQUEST, UNFOLLOW_REQUEST } from '../reducers/user';

const FollowList = ({ header, data, onClickMore, loading }) => {
  const listStyle = useMemo(() => ({ marginBottom: 20 }), []);
  const loadMoreStyle = useMemo(() => ({ textAlign: 'center', margin: '10px 0' }), []);
  const listItemStyle = useMemo(() => ({ marginTop: 20 }), []);
  const dispatch = useDispatch();

  const onCancel = useCallback((id) => () => { // 반복문에 onCancel 이 있으므로 고차함수로 적용함
    if (header === '팔로잉') {
      dispatch({
        type: UNFOLLOW_REQUEST,
        data: id,
      });
    }
    dispatch({
      type: REMOVE_FOLLOWER_REQUEST,
      data: id,
    });
  }, []);

  return (
    <List
      style={listStyle}
      grid={{ gutter: 4, xs: 2, md: 3 }}
      size="small"
      header={<div>{header}</div>}
      loadMore={(
        <div style={loadMoreStyle}>
          <Button onClick={onClickMore} loading={loading}>더 보기</Button>
        </div>
      )}
      bordered
      dataSource={data}
      renderItem={(item) => (
        <List.Item style={listItemStyle}>
          <Card actions={[<StopOutlined key="stop" onClick={onCancel(item.id)} />]}>
            <Card.Meta description={item.nickname} />
          </Card>
        </List.Item>
      )}
    />
  );
};

FollowList.propTypes = {
  header: PropTypes.string.isRequired,
  data: PropTypes.array.isRequired,
  onClickMore: PropTypes.func.isRequired,
  loading: PropTypes.bool.isRequired,
};

export default FollowList;
