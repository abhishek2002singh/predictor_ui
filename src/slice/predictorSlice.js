import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import apiClient from '../services/api';

// Async thunks
// export const fetchCutoffs = createAsyncThunk(
//   'predictor/fetchCutoffs',
//   async (params, { rejectWithValue }) => {
//     try {
//       const response = await apiClient.get('/api/predictions', { params });
//       return response;
//     } catch (error) {
//       return rejectWithValue(error.message);
//     }
//   }
// );

export const fetchCutoffs = createAsyncThunk(
  'predictor/fetchCutoffs',
  async (params, { rejectWithValue }) => {
    try {
      // Validate required parameters
      if (!params.rank || !params.category || !params.gender || !params.typeOfExam) {
        throw new Error('Missing required parameters: rank, category, gender, typeOfExam');
      }
      
      // Convert params to query string
      const queryString = new URLSearchParams({
        rank: params.rank,
        category: params.category,
        gender: params.gender,
        typeOfExam: params.typeOfExam,
        page: params.page || 1,
        limit: params.limit || 3
      }).toString();
      
      // Use query string in URL
      const response = await apiClient.get(`/api/predictions?${queryString}`);
      return response;
    } catch (error) {
      return rejectWithValue(error.message);
    }
  }
);

export const createUserData = createAsyncThunk(
  'predictor/createUserData',
  async (userData, { rejectWithValue }) => {
    try {
      const response = await apiClient.post('/api/create', userData);
      return response;
    } catch (error) {
      return rejectWithValue(error.message);
    }
  }
);

export const updateUserData = createAsyncThunk(
  'predictor/updateUserData',
  async ({ id, userData }, { rejectWithValue }) => {
    try {
      const response = await apiClient.put(`/api/update/${id}`, userData);
      return response;
    } catch (error) {
      return rejectWithValue(error.message);
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
        state.cutoffs = action.payload.data;
        state.pagination = action.payload.pagination;
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
        state.userData = action.payload.data;
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
        if (state.userData && state.userData._id === action.payload.data._id) {
          state.userData = action.payload.data;
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
  resetPredictor 
} = predictorSlice.actions;

export default predictorSlice.reducer;