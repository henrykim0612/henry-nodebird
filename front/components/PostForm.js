import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { Button, Form, Input } from 'antd';
import { useDispatch, useSelector } from 'react-redux';
import { addPost, UPLOAD_IMAGES_REQUEST, REMOVE_INDEX } from '../reducers/post';
import useInput from '../hooks/useInput';
import { baseUrl } from '../config/config';

const PostForm = () => {
  const formStyle = useMemo(() => ({ margin: '10px 0 20px' }), []);
  const buttonStyle = useMemo(() => ({ float: 'right' }), []);

  const dispatch = useDispatch();
  const { imagePaths, addPostDone } = useSelector((state) => state.post);
  const [text, onChangeText, setText] = useInput('');

  const onSubmit = useCallback(() => {
    if (!text || !text.trim()) {
      alert('게시글을 작성하세요.');
    } else {
      const formData = new FormData();
      imagePaths.forEach((p) => {
        formData.append('image', p);
      });
      formData.append('content', text);
      dispatch(addPost(formData));
    }
  }, [text, imagePaths]);

  const imageInput = useRef();
  const onClickImageUpload = useCallback(() => {
    imageInput.current.click();
  }, [imageInput.current]);

  const onChangeImages = useCallback((e) => {
    console.log('images', e.target.files);
    const imageFormData = new FormData();
    [].forEach.call(e.target.files, (f) => {
      imageFormData.append('image', f);
    });
    dispatch({
      type: UPLOAD_IMAGES_REQUEST,
      data: imageFormData,
    });
  }, []);

  const onRemoveImage = useCallback((idx) => () => {
    dispatch({
      type: REMOVE_INDEX,
      data: idx,
    });
  }, []);

  // 포스트가 추가되면 초기화
  useEffect(() => {
    if (addPostDone) {
      setText('');
    }
  }, [addPostDone]);

  return (
    <Form style={formStyle} encType="multipart/form-data" onFinish={onSubmit}>
      <Input.TextArea
        value={text}
        onChange={onChangeText}
        maxLength={140}
        placeholder="어떤 신기한 일이 있었나요?"
      />
      <div>
        <input type="file" multiple hidden ref={imageInput} onChange={onChangeImages} />
        <Button onClick={onClickImageUpload}>이미지 업로드</Button>
        <Button type="primary" style={buttonStyle} htmlType="submit">짹짹</Button>
      </div>
      <div>
        {imagePaths.map((v, i) => (
          <div key={v} style={{ display: 'inline-block' }}>
            <img src={`${baseUrl}/images/${v}`} style={{ width: '200px' }} alt={v} />
            <div>
              <Button onClick={onRemoveImage(i)}>제거</Button>
            </div>
          </div>
        ))}
      </div>
    </Form>
  );
};

export default PostForm;
