import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import apiClient from '../services/api';

// Async thunks
export const fetchCutoffs = createAsyncThunk(
  'predictor/fetchCutoffs',
  async (params, { rejectWithValue }) => {
    try {
      const { rank, category, gender, examType, typeOfExam, page = 1, limit = 10 } = params;
      
      // Use examType if provided, otherwise use typeOfExam
      const examTypeToUse = examType || typeOfExam;
      
      if (!examTypeToUse) {
        throw new Error("Exam type is required");
      }
      
      // Build query parameters
      const queryParams = new URLSearchParams({
        rank,
        category,
        gender,
        typeOfExam: examTypeToUse, // Always send as typeOfExam to API
        page: page.toString(),
        limit: limit.toString()
      });

      console.log("Fetching cutoffs with params:", params);
      console.log("Query string:", queryParams.toString());
      
      // Use apiClient instead of axios
      const response = await apiClient.get(`/api/predictions?${queryParams}`);
      return response.data;
    } catch (error) {
      console.error("Error fetching cutoffs:", error.response?.data || error.message);
      return rejectWithValue(error.response?.data?.message || error.message || "Failed to fetch cutoffs");
    }
  }
);

export const createUserData = createAsyncThunk(
  'predictor/createUserData',
  async (userData, { rejectWithValue }) => {
    try {
      console.log("Creating user data:", userData);
      const response = await apiClient.post('/api/create', userData);
      return response;
    } catch (error) {
      console.error("Error creating user data:", error.response?.data || error.message);
      return rejectWithValue(error.response?.data?.message || error.message || "Failed to create user data");
    }
  }
);

export const updateUserData = createAsyncThunk(
  'predictor/updateUserData',
  async ({ id, userData }, { rejectWithValue }) => {
    try {
      const response = await apiClient.put(`/api/update/${id}`, userData);
      return response.data;
    } catch (error) {
      console.error("Error updating user data:", error.response?.data || error.message);
      return rejectWithValue(error.response?.data?.message || error.message || "Failed to update user data");
    }
  }
);

const initialState = {
  cutoffs: [],
  userData: null,
  loading: false,
  error: null,
  pagination: {
    page: 1,
    limit: 20,
    total: 0,
    pages: 0
  },
  showMoreForm: false,
  formData: {
    firstName: '',
    lastName: '',
    emailId: ''
  },
  selectedCollege: null
};

const predictorSlice = createSlice({
  name: 'predictor',
  initialState,
  reducers: {
    setShowMoreForm: (state, action) => {
      state.showMoreForm = action.payload;
    },
    setFormData: (state, action) => {
      state.formData = { ...state.formData, ...action.payload };
    },
    resetForm: (state) => {
      state.formData = initialState.formData;
      state.showMoreForm = false;
    },
    setSelectedCollege: (state, action) => {
      state.selectedCollege = action.payload;
    },
    resetPredictor: (state) => {
      state.cutoffs = [];
      state.userData = null;
      state.loading = false;
      state.error = null;
      state.pagination = initialState.pagination;
      state.showMoreForm = false;
      state.formData = initialState.formData;
    },
    clearError: (state) => {
      state.error = null;
    }
  },
  extraReducers: (builder) => {
    builder
      // Fetch cutoffs
      .addCase(fetchCutoffs.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchCutoffs.fulfilled, (state, action) => {
        state.loading = false;
        state.cutoffs = action.payload.data?.cutoffs || action.payload.data || action.payload || [];
        state.pagination = action.payload.pagination || {
          page: 1,
          limit: state.cutoffs.length,
          total: state.cutoffs.length,
          pages: 1
        };
        if (action.payload.userData) {
          state.userData = action.payload.userData;
        }
      })
      .addCase(fetchCutoffs.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload || 'Failed to fetch cutoffs';
      })
      
      // Create user data
      .addCase(createUserData.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(createUserData.fulfilled, (state, action) => {
        state.loading = false;
        state.userData = action.payload.data || action.payload;
      })
      .addCase(createUserData.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload || 'Failed to create user data';
      })
      
      // Update user data
      .addCase(updateUserData.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(updateUserData.fulfilled, (state, action) => {
        state.loading = false;
        if (state.userData && state.userData._id === action.payload.data?._id) {
          state.userData = { ...state.userData, ...action.payload.data };
        }
        state.showMoreForm = false;
        state.formData = initialState.formData;
      })
      .addCase(updateUserData.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload || 'Failed to update user data';
      });
  }
});

export const { 
  setShowMoreForm, 
  setFormData, 
  resetForm, 
  setSelectedCollege,
  resetPredictor,
  clearError
} = predictorSlice.actions;

export default predictorSlice.reducer;