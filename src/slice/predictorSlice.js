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

// import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
// import apiClient from '../services/api';

// // LocalStorage keys
// const USER_DATA_KEY = 'predictor_user_data';
// const FORM_DATA_KEY = 'predictor_form_data';
// const VALIDITY_DAYS = 25;

// // Helper function to save data with expiry
// const saveToLocalStorage = (key, data) => {
//   const expiryDate = new Date();
//   expiryDate.setDate(expiryDate.getDate() + VALIDITY_DAYS);
  
//   const storageData = {
//     data,
//     expiry: expiryDate.getTime()
//   };
  
//   localStorage.setItem(key, JSON.stringify(storageData));
// };

// // Helper function to get data with expiry check
// const getFromLocalStorage = (key) => {
//   const item = localStorage.getItem(key);
  
//   if (!item) return null;
  
//   try {
//     const storageData = JSON.parse(item);
//     const now = new Date().getTime();
    
//     // Check if data is expired
//     if (now > storageData.expiry) {
//       localStorage.removeItem(key);
//       return null;
//     }
    
//     return storageData.data;
//   } catch (error) {
//     console.error('Error parsing localStorage data:', error);
//     localStorage.removeItem(key);
//     return null;
//   }
// };

// // Helper function to clear specific localStorage data
// const clearLocalStorage = (key) => {
//   localStorage.removeItem(key);
// };

// // Check if user has completed personal profile
// const hasUserCompletedProfile = () => {
//   const userData = getFromLocalStorage(USER_DATA_KEY);
//   return !!(userData?._id && 
//             userData?.firstName && 
//             userData?.lastName && 
//             userData?.emailId);
// };

// // Async thunks
// export const fetchCutoffs = createAsyncThunk(
//   'predictor/fetchCutoffs',
//   async (params, { rejectWithValue, getState }) => {
//     try {
//       const { 
//         rank, 
//         category, 
//         gender, 
//         examType, 
//         typeOfExam, 
//         page = 1, 
//         limit = 10,
//         year,
//         round,
//         branch,
//         institute,
//         quota
//       } = params;
      
//       const examTypeToUse = examType || typeOfExam;
      
//       if (!examTypeToUse) {
//         throw new Error("Exam type is required");
//       }
      
//       // Build query parameters with all filters
//       const queryParams = new URLSearchParams({
//         rank,
//         category,
//         gender,
//         typeOfExam: examTypeToUse,
//         page: page.toString(),
//         limit: limit.toString()
//       });

//       // Add optional filters if they exist
//       if (year && year !== 'all') queryParams.append('year', year);
//       if (round && round !== 'all') queryParams.append('round', round);
//       if (branch && branch !== 'all') queryParams.append('branch', branch);
//       if (institute && institute !== 'all') queryParams.append('institute', institute);
//       if (quota && quota !== 'all') queryParams.append('quota', quota);
      
//       console.log("Fetching cutoffs with params:", params);
      
//       const response = await apiClient.get(`/api/predictions?${queryParams}`);
      
//       return response;
//     } catch (error) {
//       console.error("Error fetching cutoffs:", error.response?.data || error.message);
//       return rejectWithValue(error.response?.data?.message || error.message || "Failed to fetch cutoffs");
//     }
//   }
// );

// export const createUserData = createAsyncThunk(
//   'predictor/createUserData',
//   async (userData, { rejectWithValue }) => {
//     try {
//       console.log("Creating user data:", userData);
//       const response = await apiClient.post('/api/create', userData);
      
//       // Save to localStorage on successful creation
//       if (response.data) {
//         saveToLocalStorage(USER_DATA_KEY, response.data);
//       }
      
//       return response;
//     } catch (error) {
//       console.error("Error creating user data:", error.response?.data || error.message);
//       return rejectWithValue(error.response?.data?.message || error.message || "Failed to create user data");
//     }
//   }
// );

// export const updateUserData = createAsyncThunk(
//   'predictor/updateUserData',
//   async ({ id, userData }, { rejectWithValue }) => {
//     try {
//       const response = await apiClient.put(`/api/update/${id}`, userData);
      
//       // Save updated data to localStorage
//       if (response.data) {
//         saveToLocalStorage(USER_DATA_KEY, response.data);
//       }
      
//       return response.data;
//     } catch (error) {
//       console.error("Error updating user data:", error.response?.data || error.message);
//       return rejectWithValue(error.response?.data?.message || error.message || "Failed to update user data");
//     }
//   }
// );

// // Load initial state from localStorage
// const loadInitialState = () => {
//   const savedUserData = getFromLocalStorage(USER_DATA_KEY);
//   const savedFormData = getFromLocalStorage(FORM_DATA_KEY);
  
//   return {
//     cutoffs: [],
//     userData: savedUserData,
//     loading: false,
//     error: null,
//     pagination: {
//       page: 1,
//       limit: 20,
//       total: 0,
//       pages: 0
//     },
//     showMoreForm: false,
//     formData: savedFormData || {
//       firstName: '',
//       lastName: '',
//       emailId: ''
//     },
//     selectedCollege: null,
//     // Add a flag to track if user has completed profile
//     hasCompletedProfile: hasUserCompletedProfile()
//   };
// };

// const predictorSlice = createSlice({
//   name: 'predictor',
//   initialState: loadInitialState(),
//   reducers: {
//     setShowMoreForm: (state, action) => {
//       state.showMoreForm = action.payload;
//     },
//     setFormData: (state, action) => {
//       state.formData = { ...state.formData, ...action.payload };
//       // Save form data to localStorage
//       saveToLocalStorage(FORM_DATA_KEY, state.formData);
//     },
//     resetForm: (state) => {
//       state.formData = {
//         firstName: '',
//         lastName: '',
//         emailId: ''
//       };
//       state.showMoreForm = false;
//       clearLocalStorage(FORM_DATA_KEY);
//     },
//     setSelectedCollege: (state, action) => {
//       state.selectedCollege = action.payload;
//     },
//     resetPredictor: (state) => {
//       state.cutoffs = [];
//       state.userData = null;
//       state.loading = false;
//       state.error = null;
//       state.pagination = {
//         page: 1,
//         limit: 20,
//         total: 0,
//         pages: 0
//       };
//       state.showMoreForm = false;
//       state.formData = {
//         firstName: '',
//         lastName: '',
//         emailId: ''
//       };
//       state.hasCompletedProfile = false;
//       // Clear localStorage
//       clearLocalStorage(USER_DATA_KEY);
//       clearLocalStorage(FORM_DATA_KEY);
//     },
//     clearError: (state) => {
//       state.error = null;
//     },
//     // New action to sync localStorage data
//     syncFromLocalStorage: (state) => {
//       const savedUserData = getFromLocalStorage(USER_DATA_KEY);
//       const savedFormData = getFromLocalStorage(FORM_DATA_KEY);
      
//       if (savedUserData) {
//         state.userData = savedUserData;
//       }
      
//       if (savedFormData) {
//         state.formData = savedFormData;
//       }
      
//       // Update hasCompletedProfile flag
//       state.hasCompletedProfile = hasUserCompletedProfile();
//     },
//     // Action to clear only user data (for logout scenario)
//     clearUserData: (state) => {
//       state.userData = null;
//       state.hasCompletedProfile = false;
//       clearLocalStorage(USER_DATA_KEY);
//     },
//     // Action to update hasCompletedProfile flag
//     updateProfileStatus: (state) => {
//       state.hasCompletedProfile = hasUserCompletedProfile();
//     }
//   },
//   extraReducers: (builder) => {
//     builder
//       // Fetch cutoffs
//       .addCase(fetchCutoffs.pending, (state) => {
//         state.loading = true;
//         state.error = null;
//       })
//       .addCase(fetchCutoffs.fulfilled, (state, action) => {
//         state.loading = false;
//         state.cutoffs = action.payload.data?.cutoffs || action.payload.data || action.payload || [];
//         state.pagination = action.payload.pagination || {
//           page: 1,
//           limit: state.cutoffs.length,
//           total: state.cutoffs.length,
//           pages: 1
//         };
//         if (action.payload.userData) {
//           state.userData = action.payload.userData;
//           state.hasCompletedProfile = hasUserCompletedProfile();
//         }
//       })
//       .addCase(fetchCutoffs.rejected, (state, action) => {
//         state.loading = false;
//         state.error = action.payload || 'Failed to fetch cutoffs';
//       })
      
//       // Create user data
//       .addCase(createUserData.pending, (state) => {
//         state.loading = true;
//         state.error = null;
//       })
//       .addCase(createUserData.fulfilled, (state, action) => {
//         state.loading = false;
//         state.userData = action.payload.data || action.payload;
//         state.hasCompletedProfile = true;
//       })
//       .addCase(createUserData.rejected, (state, action) => {
//         state.loading = false;
//         state.error = action.payload || 'Failed to create user data';
//       })
      
//       // Update user data
//       .addCase(updateUserData.pending, (state) => {
//         state.loading = true;
//         state.error = null;
//       })
//       .addCase(updateUserData.fulfilled, (state, action) => {
//         state.loading = false;
//         if (state.userData && state.userData._id === action.payload.data?._id) {
//           state.userData = { ...state.userData, ...action.payload.data };
//         }
//         state.showMoreForm = false;
//         state.hasCompletedProfile = true;
//         // Don't reset form data to empty, keep saved values
//       })
//       .addCase(updateUserData.rejected, (state, action) => {
//         state.loading = false;
//         state.error = action.payload || 'Failed to update user data';
//       });
//   }
// });

// export const { 
//   setShowMoreForm, 
//   setFormData, 
//   resetForm, 
//   setSelectedCollege,
//   resetPredictor,
//   clearError,
//   syncFromLocalStorage,
//   clearUserData,
//   updateProfileStatus
// } = predictorSlice.actions;

// export default predictorSlice.reducer;