import authSlice from './authSlice';

export const actions = {
  ...authSlice.actions,
};

export const selectors = {
  ...authSlice.selectors,
};

export { authSlice };
