
import { configureStore } from '@reduxjs/toolkit';
import predictorReducer from '../slice/predictorSlice';

export const store = configureStore({
  reducer: {
    predictor: predictorReducer,
  },
});