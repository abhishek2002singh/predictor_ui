// store/slices/analyticsSlice.js
import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import analyticsService from "../services/analysisService";

/* ======================
   ASYNC THUNKS
====================== */

export const fetchUserAnalytics = createAsyncThunk(
  "analytics/fetchUserAnalytics",
  async (_, { rejectWithValue }) => {
    try {
      return await analyticsService.getUserAnalytics();
    } catch (err) {
      return rejectWithValue(err.message);
    }
  }
);

export const fetchUploadAnalytics = createAsyncThunk(
  "analytics/fetchUploadAnalytics",
  async (_, { rejectWithValue }) => {
    try {
      return await analyticsService.getUploadAnalytics();
    } catch (err) {
      return rejectWithValue(err.message);
    }
  }
);

export const fetchAssistanceAnalytics = createAsyncThunk(
  "analytics/fetchAssistanceAnalytics",
  async (_, { rejectWithValue }) => {
    try {
      return await analyticsService.getAssistanceAnalytics();
    } catch (err) {
      return rejectWithValue(err.message);
    }
  }
);

export const fetchAdminAnalytics = createAsyncThunk(
  "analytics/fetchAdminAnalytics",
  async (_, { rejectWithValue }) => {
    try {
      return await analyticsService.getAdminAnalytics();
    } catch (err) {
      return rejectWithValue(err.message);
    }
  }
);

/* ======================
   INITIAL STATE
====================== */

const initialState = {
  userAnalytics: null,
  uploadAnalytics: null,
  assistanceAnalytics: null,
  adminAnalytics: null,

  loading: {
    user: false,
    upload: false,
    assistance: false,
    admin: false
  },

  error: {
    user: null,
    upload: null,
    assistance: null,
    admin: null
  },

  lastUpdated: null
};

/* ======================
   SLICE
====================== */

const analyticsSlice = createSlice({
  name: "analytics",
  initialState,
  reducers: {
    clearAnalyticsErrors(state) {
      Object.keys(state.error).forEach((key) => {
        state.error[key] = null;
      });
    },
    resetAnalytics() {
      return initialState;
    }
  },
  extraReducers: (builder) => {
    builder

      /* USER */
      .addCase(fetchUserAnalytics.pending, (state) => {
        state.loading.user = true;
      })
      .addCase(fetchUserAnalytics.fulfilled, (state, action) => {
        state.loading.user = false;
        state.userAnalytics = action.payload;
        state.lastUpdated = new Date().toISOString();
      })
      .addCase(fetchUserAnalytics.rejected, (state, action) => {
        state.loading.user = false;
        state.error.user = action.payload;
      })

      /* UPLOAD */
      .addCase(fetchUploadAnalytics.pending, (state) => {
        state.loading.upload = true;
      })
      .addCase(fetchUploadAnalytics.fulfilled, (state, action) => {
        state.loading.upload = false;
        state.uploadAnalytics = action.payload;
        state.lastUpdated = new Date().toISOString();
      })
      .addCase(fetchUploadAnalytics.rejected, (state, action) => {
        state.loading.upload = false;
        state.error.upload = action.payload;
      })

      /* ASSISTANCE */
      .addCase(fetchAssistanceAnalytics.pending, (state) => {
        state.loading.assistance = true;
      })
      .addCase(fetchAssistanceAnalytics.fulfilled, (state, action) => {
        state.loading.assistance = false;
        state.assistanceAnalytics = action.payload;
        state.lastUpdated = new Date().toISOString();
      })
      .addCase(fetchAssistanceAnalytics.rejected, (state, action) => {
        state.loading.assistance = false;
        state.error.assistance = action.payload;
      })

      /* ADMIN */
      .addCase(fetchAdminAnalytics.pending, (state) => {
        state.loading.admin = true;
      })
      .addCase(fetchAdminAnalytics.fulfilled, (state, action) => {
        state.loading.admin = false;
        state.adminAnalytics = action.payload;
        state.lastUpdated = new Date().toISOString();
      })
      .addCase(fetchAdminAnalytics.rejected, (state, action) => {
        state.loading.admin = false;
        state.error.admin = action.payload;
      });
  }
});

/* ======================
   EXPORTS
====================== */

export const { clearAnalyticsErrors, resetAnalytics } =
  analyticsSlice.actions;

export default analyticsSlice.reducer;
