import { createSlice } from '@reduxjs/toolkit';
const initialState = {
  random: null,
  userDetails: null,
  connection: null,
  listLoading: false,
  actionsLoading: false,
  error: null,
};
export const callTypes = {
  list: 'list',
  action: 'action',
};

export const globalSlice = createSlice({
  name: 'global',
  initialState: initialState,
  reducers: {
    catchError: (state, action) => {
      state.error = `${action.type}: ${action.payload.error}`;
      if (action.payload.callType === callTypes.list) {
        state.listLoading = false;
      } else {
        state.actionsLoading = false;
      }
    },
    startCall: (state, action) => {
      state.error = null;
      if (action.payload.callType === callTypes.list) {
        state.listLoading = true;
      } else {
        state.actionsLoading = true;
      }
    },

    setRandom: (state, action) => {
      state.random = Math.random().toString(32);
    },
    setConnection: (state, action) => {
      state.connection = action.payload;
    },
    setUserDetails: (state, action) => {
      const payload = action.payload;
      state.userDetails = payload;
    },
  },
});
