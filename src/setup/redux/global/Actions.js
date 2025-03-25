import { globalSlice, callTypes } from './Slice';

const { actions } = globalSlice;

export const setRandom = () => dispatch => {
  dispatch(actions.setRandom());
};

export const setUserDetails = data => dispatch => {
  dispatch(actions.setUserDetails(data));
};
