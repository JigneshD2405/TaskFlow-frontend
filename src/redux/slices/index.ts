import authSlice from './authSlice';
import boardSlice from './boardSlice';

export const actions = {
  ...authSlice.actions,
  ...boardSlice.actions,
};

export const selectors = {
  ...authSlice.selectors,
  ...boardSlice.selectors,
};

export { authSlice, boardSlice };
