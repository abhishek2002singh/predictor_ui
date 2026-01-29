
import { configureStore } from '@reduxjs/toolkit';
import predictorReducer from '../slice/predictorSlice';
import analyticsReducer from '../slice/analysisSlice';
import rankPredictionReducer from '../slice/rankPredictionSlice'
import userReducer from '../slice/userSlice'

export const store = configureStore({
  reducer: {
    predictor: predictorReducer,
     analytics: analyticsReducer,
      rankPrediction: rankPredictionReducer,
      user :userReducer
  },
   middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware({
      serializableCheck: false,
    }),
});