
import { configureStore } from '@reduxjs/toolkit';
import predictorReducer from '../slice/predictorSlice';
import analyticsReducer from '../slice/analysisSlice';

export const store = configureStore({
  reducer: {
    predictor: predictorReducer,
     analytics: analyticsReducer,
  },
   middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware({
      serializableCheck: false,
    }),
});