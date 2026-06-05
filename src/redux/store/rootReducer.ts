import { combineReducers } from '@reduxjs/toolkit';
import { authSlice, } from '../slices';

const rootReducer = combineReducers({
  auth: authSlice.reducer,

});

export default rootReducer;
