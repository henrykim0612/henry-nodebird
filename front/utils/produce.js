/* 이렇게 하지 않으면 IE 에서 immer 가 동작하지 않음.. */
import { enableES5, produce } from 'immer';

export default (...args) => {
  enableES5();
  return produce(...args);
};
