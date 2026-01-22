// store/slices/analyticsSlice.js
import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import analyticsService from '../services/analysisService';

// Async thunks for each analytics type
export const fetchUserAnalytics = createAsyncThunk(
    'analytics/fetchUserAnalytics',
    async (_, { rejectWithValue }) => {
        try {
            return await analyticsService.getUserAnalytics();
        } catch (error) {
            return rejectWithValue(error.message || 'Failed to fetch user analytics');
        }
    }
);

export const fetchUploadAnalytics = createAsyncThunk(
    'analytics/fetchUploadAnalytics',
    async (_, { rejectWithValue }) => {
        try {
            return await analyticsService.getUploadAnalytics();
        } catch (error) {
            return rejectWithValue(error.message || 'Failed to fetch upload analytics');
        }
    }
);

export const fetchAssistanceAnalytics = createAsyncThunk(
    'analytics/fetchAssistanceAnalytics',
    async (_, { rejectWithValue }) => {
        try {
            return await analyticsService.getAssistanceAnalytics();
        } catch (error) {
            return rejectWithValue(error.message || 'Failed to fetch assistance analytics');
        }
    }
);

export const fetchAdminAnalytics = createAsyncThunk(
    'analytics/fetchAdminAnalytics',
    async (_, { rejectWithValue }) => {
        try {
            return await analyticsService.getAdminAnalytics();
        } catch (error) {
            return rejectWithValue(error.message || 'Failed to fetch admin analytics');
        }
    }
);

// Fetch all analytics at once
export const fetchAllAnalytics = createAsyncThunk(
    'analytics/fetchAllAnalytics',
    async (_, { rejectWithValue }) => {
        try {
            return await analyticsService.getAllAnalytics();
        } catch (error) {
            return rejectWithValue(error.message || 'Failed to fetch all analytics');
        }
    }
);

const initialState = {
    // Data states
    userAnalytics: null,
    uploadAnalytics: null,
    assistanceAnalytics: null,
    adminAnalytics: null,
    
    // Loading states
    loading: {
        user: false,
        upload: false,
        assistance: false,
        admin: false,
        all: false
    },
    
    // Error states
    error: {
        user: null,
        upload: null,
        assistance: null,
        admin: null,
        all: null
    },
    
    // Active tab/view
    activeView: 'summary', // 'summary', 'user', 'upload', 'assistance', 'admin'
    
    // Time range filter (optional)
    timeRange: 'month', // 'day', 'week', 'month', 'year'
    
    // Refresh timestamp
    lastUpdated: null
};

const analyticsSlice = createSlice({
    name: 'analytics',
    initialState,
    reducers: {
        setActiveView: (state, action) => {
            state.activeView = action.payload;
        },
        setTimeRange: (state, action) => {
            state.timeRange = action.payload;
        },
        clearErrors: (state) => {
            state.error = {
                user: null,
                upload: null,
                assistance: null,
                admin: null,
                all: null
            };
        },
        resetAnalytics: (state) => {
            return { ...initialState, activeView: state.activeView };
        }
    },
    extraReducers: (builder) => {
        // User Analytics
        builder.addCase(fetchUserAnalytics.pending, (state) => {
            state.loading.user = true;
            state.error.user = null;
        });
        builder.addCase(fetchUserAnalytics.fulfilled, (state, action) => {
            state.loading.user = false;
            state.userAnalytics = action.payload;
            state.lastUpdated = new Date().toISOString();
        });
        builder.addCase(fetchUserAnalytics.rejected, (state, action) => {
            state.loading.user = false;
            state.error.user = action.payload || 'Failed to fetch user analytics';
        });

        // Upload Analytics
        builder.addCase(fetchUploadAnalytics.pending, (state) => {
            state.loading.upload = true;
            state.error.upload = null;
        });
        builder.addCase(fetchUploadAnalytics.fulfilled, (state, action) => {
            state.loading.upload = false;
            state.uploadAnalytics = action.payload;
            state.lastUpdated = new Date().toISOString();
        });
        builder.addCase(fetchUploadAnalytics.rejected, (state, action) => {
            state.loading.upload = false;
            state.error.upload = action.payload || 'Failed to fetch upload analytics';
        });

        // Assistance Analytics
        builder.addCase(fetchAssistanceAnalytics.pending, (state) => {
            state.loading.assistance = true;
            state.error.assistance = null;
        });
        builder.addCase(fetchAssistanceAnalytics.fulfilled, (state, action) => {
            state.loading.assistance = false;
            state.assistanceAnalytics = action.payload;
            state.lastUpdated = new Date().toISOString();
        });
        builder.addCase(fetchAssistanceAnalytics.rejected, (state, action) => {
            state.loading.assistance = false;
            state.error.assistance = action.payload || 'Failed to fetch assistance analytics';
        });

        // Admin Analytics
        builder.addCase(fetchAdminAnalytics.pending, (state) => {
            state.loading.admin = true;
            state.error.admin = null;
        });
        builder.addCase(fetchAdminAnalytics.fulfilled, (state, action) => {
            state.loading.admin = false;
            state.adminAnalytics = action.payload;
            state.lastUpdated = new Date().toISOString();
        });
        builder.addCase(fetchAdminAnalytics.rejected, (state, action) => {
            state.loading.admin = false;
            state.error.admin = action.payload || 'Failed to fetch admin analytics';
        });

        // All Analytics
        builder.addCase(fetchAllAnalytics.pending, (state) => {
            state.loading.all = true;
            state.error.all = null;
        });
        builder.addCase(fetchAllAnalytics.fulfilled, (state, action) => {
            state.loading.all = false;
            state.userAnalytics = action.payload.user;
            state.uploadAnalytics = action.payload.upload;
            state.assistanceAnalytics = action.payload.assistance;
            state.adminAnalytics = action.payload.admin;
            state.lastUpdated = new Date().toISOString();
        });
        builder.addCase(fetchAllAnalytics.rejected, (state, action) => {
            state.loading.all = false;
            state.error.all = action.payload || 'Failed to fetch all analytics';
        });
    }
});

export const { setActiveView, setTimeRange, clearErrors, resetAnalytics } = analyticsSlice.actions;

// Selectors
export const selectActiveView = (state) => state.analytics.activeView;
export const selectUserAnalytics = (state) => state.analytics.userAnalytics;
export const selectUploadAnalytics = (state) => state.analytics.uploadAnalytics;
export const selectAssistanceAnalytics = (state) => state.analytics.assistanceAnalytics;
export const selectAdminAnalytics = (state) => state.analytics.adminAnalytics;
export const selectIsLoading = (state) => state.analytics.loading;
export const selectHasError = (state) => state.analytics.error;

// Summary selector
export const selectSummaryData = (state) => {
    const user = state.analytics.userAnalytics?.data?.summary;
    const upload = state.analytics.uploadAnalytics?.data;
    const assistance = state.analytics.assistanceAnalytics?.data;
    const admin = state.analytics.adminAnalytics?.data;

    return {
        user: {
            total: user?.totalUsers || 0,
            active: user?.activeUsers || 0,
            today: user?.todayNewUsers || 0,
            growth: user?.growthRate || '0%'
        },
        upload: {
            total: upload?.totalCutoffEntries || 0,
            years: upload?.yearWiseUpload?.length || 0
        },
        assistance: {
            total: assistance?.totalAssistants || 0,
            active: assistance?.activeAssistants || 0
        },
        admin: {
            total: admin?.totalAssistants || 0, // Note: This should be totalAdmins
            active: admin?.activeAssistants || 0
        }
    };
};

export default analyticsSlice.reducer;