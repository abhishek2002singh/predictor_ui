import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import rankPredictionService from '../services/rankPredictorForCollege'

/* ======================
   ASYNC THUNKS
====================== */

export const fetchRankPrediction = createAsyncThunk(
  "rankPrediction/fetchRankPrediction",
  async (predictionData, { rejectWithValue, getState }) => {
    try {
      const state = getState();
      const { showAllData } = state.rankPrediction;
      
      // Add user details to request if available in localStorage
      const userDetails = getUserDetailsFromStorage();
      if (showAllData && userDetails) {
        return await rankPredictionService?.getRankPrediction({
          ...predictionData,
          showAll: true,
          userDetails
        });
      }
      return await rankPredictionService?.getRankPrediction(predictionData);
    } catch (err) {
      return rejectWithValue(err.message);
    }
  }
);

export const submitUserDetails = createAsyncThunk(
  "rankPrediction/submitUserDetails",
  async (userData, { rejectWithValue, dispatch }) => {
    try {
      const response = await rankPredictionService?.userDetailsFromRankPredictions(userData);
      
      // Save user details to localStorage with expiration (25 days)
      saveUserDetailsToStorage({
        ...userData,
        submittedAt: new Date().toISOString()
      });
      
      // Update local state
      dispatch(setUserDetailsSubmitted(true));
      dispatch(showAllData());
      
      return response;
    } catch (err) {
      return rejectWithValue(err.message);
    }
  }
);

/* ======================
   STORAGE HELPER FUNCTIONS
====================== */

const STORAGE_KEY = 'rankPredictionUserDetails';
const EXPIRY_DAYS = 25;

// Save user details with expiration
const saveUserDetailsToStorage = (userData) => {
  try {
    const expiryDate = new Date();
    expiryDate.setDate(expiryDate.getDate() + EXPIRY_DAYS);
    
    const dataToStore = {
      userData,
      expiresAt: expiryDate.toISOString()
    };
    
    localStorage.setItem(STORAGE_KEY, JSON.stringify(dataToStore));
  } catch (error) {
    console.error('Error saving user details to localStorage:', error);
  }
};

// Get user details from storage (checking expiration)
const getUserDetailsFromStorage = () => {
  try {
    const storedData = localStorage.getItem(STORAGE_KEY);
    if (!storedData) return null;
    
    const { userData, expiresAt } = JSON.parse(storedData);
    
    // Check if data is expired
    if (new Date() > new Date(expiresAt)) {
      localStorage.removeItem(STORAGE_KEY);
      return null;
    }
    
    return userData;
  } catch (error) {
    console.error('Error reading user details from localStorage:', error);
    return null;
  }
};

// Check if user details exist and are valid
const isUserDetailsValid = () => {
  const userDetails = getUserDetailsFromStorage();
  return !!userDetails;
};

/* ======================
   INITIAL STATE
====================== */

const initialState = {
  predictionData: null,
  loading: false,
  submitLoading: false,
  error: null,
  submitError: null,
  lastUpdated: null,
  showAllData: false,
  // Initialize from localStorage
  userDetailsSubmitted: isUserDetailsValid(),
  userDetailsResponse: null
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
    },
    resetRankPrediction() {
      return {
        ...initialState,
        // Preserve userDetailsSubmitted from localStorage
        userDetailsSubmitted: isUserDetailsValid()
      };
    },
    showAllData(state) {
      state.showAllData = true;
    },
    setUserDetailsSubmitted(state, action) {
      state.userDetailsSubmitted = action.payload;
    },
    clearUserDetails(state) {
      state.userDetailsSubmitted = false;
      state.userDetailsResponse = null;
      localStorage.removeItem(STORAGE_KEY);
    },
    // New action to check and update user details status
    checkUserDetailsStatus(state) {
      state.userDetailsSubmitted = isUserDetailsValid();
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
        state.userDetailsResponse = action.payload;
      })
      .addCase(submitUserDetails.rejected, (state, action) => {
        state.submitLoading = false;
        state.submitError = action.payload;
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
  setUserDetailsSubmitted,
  clearUserDetails,
  checkUserDetailsStatus
} = rankPredictionSlice.actions;

export default rankPredictionSlice.reducer;