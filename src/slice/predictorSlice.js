import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import apiClient from '../services/api';

// Helper function to clean parameters
const cleanParams = (params) => {
  const cleaned = {};
  
  Object.keys(params).forEach(key => {
    const value = params[key];
    
    // Only include values that are not undefined, null, or 'all'
    if (value !== undefined && value !== null && value !== 'all' && value !== '') {
      cleaned[key] = value;
    }
  });
  
  return cleaned;
};

// Async thunks
export const fetchCutoffs = createAsyncThunk(
  'predictor/fetchCutoffs',
  async (params, { rejectWithValue }) => {
    try {
      console.log("Original params received:", params);
      
      // Clean the parameters first
      const cleanedParams = cleanParams(params);
      
      console.log("Cleaned params:", cleanedParams);
      
      const { rank, category, gender, examType, typeOfExam, page = 1, limit = 20, year, round, branch, institute, quota } = cleanedParams;
      
      // Use examType if provided, otherwise use typeOfExam
      const examTypeToUse = examType || typeOfExam;
      
      if (!examTypeToUse) {
        throw new Error("Exam type is required");
      }
      
      // Build query parameters with cleaned params
      const queryParams = new URLSearchParams({
        rank,
        typeOfExam: examTypeToUse,
        page: page.toString(),
        limit: limit.toString()
      });
      
      // Only add optional parameters if they exist
      if (category) queryParams.append('category', category);
      if (gender) queryParams.append('gender', gender);
      if (year) queryParams.append('year', year);
      if (round) queryParams.append('round', round);
      if (branch) queryParams.append('branch', branch);
      if (institute) queryParams.append('institute', institute);
      if (quota) queryParams.append('quota', quota);
      
      console.log("Query string:", queryParams.toString());
      
      // Use apiClient instead of axios
      const response = await apiClient.get(`/api/predictions?${queryParams}`);
      return response;
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
          page: action.payload.page || 1,
          limit: action.payload.limit || 20,
          total: action.payload.total || 0,
          pages: action.payload.pages || 1
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