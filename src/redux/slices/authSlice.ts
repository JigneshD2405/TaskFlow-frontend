import { createSlice } from '@reduxjs/toolkit';

interface UserState {
  user: {
    _id?: string;
    name?: string;
    email?: string;
    accessToken?: string;
  } | null;
}

const initialState: UserState = { user: null };

const authSlice = createSlice({
  name: 'auth',
  initialState,
  reducers: {
    setUser: (state, { payload }) => {
      state.user = payload;
    },
    setAccessToken: (state, { payload }) => {
      if (state.user) state.user.accessToken = payload;
    },
    logout: () => initialState,
  },
  selectors: {
    selectUser: (state) => state.user,
    selectAccessToken: (state) => state.user?.accessToken,
  },
});

export default authSlice;
