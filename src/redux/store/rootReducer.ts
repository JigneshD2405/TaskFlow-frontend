import { combineReducers } from '@reduxjs/toolkit';
import { authSlice, boardSlice } from '../slices';

const rootReducer = combineReducers({
  auth: authSlice.reducer,
  board: boardSlice.reducer,
});

export default rootReducer;
