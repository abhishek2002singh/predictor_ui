// // store/slices/rankPredictionSlice.js
// import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
// import rankPredictionService from "../services/rankPredictorForCollege";

// /* ======================
//    ASYNC THUNK
// ====================== */

// export const fetchRankPrediction = createAsyncThunk(
//   "rankPrediction/fetchRankPrediction",
//   async (predictionData, { rejectWithValue }) => {
//     try {
//       return await rankPredictionService.getRankPrediction(predictionData);
//     } catch (err) {
//       return rejectWithValue(err.message);
//     }
//   }
// );

// /* ======================
//    INITIAL STATE
// ====================== */

// const initialState = {
//   predictionData: null,
//   loading: false,
//   error: null,
//   lastUpdated: null
// };

// /* ======================
//    SLICE
// ====================== */

// const rankPredictionSlice = createSlice({
//   name: "rankPrediction",
//   initialState,
//   reducers: {
//     clearRankPrediction(state) {
//       state.predictionData = null;
//       state.error = null;
//     },
//     resetRankPrediction() {
//       return initialState;
//     }
//   },
//   extraReducers: (builder) => {
//     builder
//       .addCase(fetchRankPrediction.pending, (state) => {
//         state.loading = true;
//         state.error = null;
//       })
//       .addCase(fetchRankPrediction.fulfilled, (state, action) => {
//         state.loading = false;
//         state.predictionData = action.payload;
//         state.lastUpdated = new Date().toISOString();
//       })
//       .addCase(fetchRankPrediction.rejected, (state, action) => {
//         state.loading = false;
//         state.error = action.payload;
//       });
//   }
// });

// /* ======================
//    EXPORTS
// ====================== */

// export const { clearRankPrediction, resetRankPrediction } = rankPredictionSlice.actions;
// export default rankPredictionSlice.reducer;



// store/slices/rankPredictionSlice.js
import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import rankPredictionService from "../services/rankPredictorForCollege";

/* ======================
   ASYNC THUNK
====================== */

export const fetchRankPrediction = createAsyncThunk(
  "rankPrediction/fetchRankPrediction",
  async (predictionData, { rejectWithValue }) => {
    try {
      return await rankPredictionService.getRankPrediction(predictionData);
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
  error: null,
  lastUpdated: null,
  showAllData: false, // New state to track if all data should be shown
  userDetailsSubmitted: false // Track if user submitted details
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
    // New reducer to show all data
    showAllData(state) {
      state.showAllData = true;
    },
    // New reducer to mark user details as submitted
    setUserDetailsSubmitted(state, action) {
      state.userDetailsSubmitted = action.payload;
    }
  },
  extraReducers: (builder) => {
    builder
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