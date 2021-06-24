import { HYDRATE } from 'next-redux-wrapper';
import { combineReducers } from 'redux';
import user from './user';
import post from './post';

// (이전상태, 액션) => 다음상태를 만들어냄
// combineReducers 로 쪼개져 있는 리듀서를 모음.
// const rootReducer = combineReducers({
//   index: (state = {}, action) => {
//     switch (action.type) {
//       // HYDRATE는 next-redux-wrapper를 쓸 때 필요한 액션.
//       // 서버쪽에서 실행된 리덕스의 결과물이 프론트에서는 HYDRATE라는 액션 이름 아래에 데이터로 전달.
//       case HYDRATE: // getServerSideProps 실행된 결과를 HYDRATE 로 보내줌
//         return { ...state, ...action.payload };
//       default:
//         return state;
//     }
//   },
//   user,
//   post,
// });

// Next 서버사이드 렌더링으로 위에 구조에서 아래 구조로 바뀜
// 바꾸지 않고 위에 구조대로 하면 user, post 로 나와야 되는데 HYDRATE 실행 결과 이후에 index 아래에 user, post 가 생겨버림.
const rootReducer = (state, action) => {
  switch (action.type) {
    case HYDRATE: // 서버 사이드 렌더링이 완료되었을때 호출되는 액션
      console.log('HYDRATE', action);
      return action.payload;
    default: {
      const combinedReducer = combineReducers({
        user,
        post,
      });
      return combinedReducer(state, action);
    }
  }
};

export default rootReducer;
