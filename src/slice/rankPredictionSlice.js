import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import rankPredictionService from '../services/rankPredictorForCollege'

/* ======================
   ASYNC THUNKS
====================== */

export const fetchRankPrediction = createAsyncThunk(
  "rankPrediction/fetchRankPrediction",
  async (predictionData, { rejectWithValue }) => {
    try {
      return await rankPredictionService?.getRankPrediction(predictionData);
    } catch (err) {
      return rejectWithValue(err.message);
    }
  }
);

export const submitUserDetails = createAsyncThunk(
  "rankPrediction/submitUserDetails",
  async (userData, { rejectWithValue }) => {
    try {
      return await rankPredictionService?.userDetailsFromRankPredictions(userData);
    } catch (err) {
      return rejectWithValue(err.message);
    }
  }
);

/* ======================
   INITIAL STATE
====================== */

const initialState = {
  predictionData: null,
  loading: false,
  submitLoading: false, // Separate loading state for user details submission
  error: null,
  submitError: null, // Separate error state for user details submission
  lastUpdated: null,
  showAllData: false,
  userDetailsSubmitted: false,
  userDetailsResponse: null // Store the response from user details submission
};

/* ======================
   SLICE
====================== */

const rankPredictionSlice = createSlice({
  name: "rankPrediction",
  initialState,
  reducers: {
    clearRankPrediction(state) {
      state.predictionData = null;
      state.error = null;
      state.showAllData = false;
      state.userDetailsSubmitted = false;
    },
    resetRankPrediction() {
      return initialState;
    },
    showAllData(state) {
      state.showAllData = true;
    },
    setUserDetailsSubmitted(state, action) {
      state.userDetailsSubmitted = action.payload;
    }
  },
  extraReducers: (builder) => {
    builder
      // Fetch Rank Prediction
      .addCase(fetchRankPrediction.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchRankPrediction.fulfilled, (state, action) => {
        state.loading = false;
        state.predictionData = action.payload;
        state.lastUpdated = new Date().toISOString();
      })
      .addCase(fetchRankPrediction.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      
      // Submit User Details
      .addCase(submitUserDetails.pending, (state) => {
        state.submitLoading = true;
        state.submitError = null;
      })
      .addCase(submitUserDetails.fulfilled, (state, action) => {
        state.submitLoading = false;
        state.userDetailsSubmitted = true;
        state.userDetailsResponse = action.payload;
      })
      .addCase(submitUserDetails.rejected, (state, action) => {
        state.submitLoading = false;
        state.submitError = action.payload;
        state.userDetailsSubmitted = false;
      });
  }
});

/* ======================
   EXPORTS
====================== */

export const { 
  clearRankPrediction, 
  resetRankPrediction, 
  showAllData,
  setUserDetailsSubmitted 
} = rankPredictionSlice.actions;

export default rankPredictionSlice.reducer;