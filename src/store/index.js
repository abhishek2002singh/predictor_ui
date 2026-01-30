
import { configureStore } from '@reduxjs/toolkit';
import predictorReducer from '../slice/predictorSlice';
import analyticsReducer from '../slice/analysisSlice';
import rankPredictionReducer from '../slice/rankPredictionSlice'


export const store = configureStore({
  reducer: {
    predictor: predictorReducer,
     analytics: analyticsReducer,
      rankPrediction: rankPredictionReducer,
      
  },
   middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware({
      serializableCheck: false,
    }),
});