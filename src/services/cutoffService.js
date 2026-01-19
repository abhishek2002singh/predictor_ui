import apiClient from "./api";
import API_ROUTES from "../config/routes";

export const cutoffService = {
  // Upload CSV data with progress tracking
  uploadCutoffCSV: async (formData, onProgress) => {
    try {
      // Use the upload method with progress tracking
      const response = await apiClient.upload(API_ROUTES.CUTOFF.UPLOAD, formData, onProgress);
      return response;
    } catch (error) {
      throw error;
    }
  },

  // Or use regular post without progress
  uploadCutoffCSVSimple: async (file, year, round) => {
    const formData = new FormData();
    formData.append('csvfile', file);
    formData.append('year', year);
    formData.append('round', round);
    
    const response = await apiClient.post(API_ROUTES.CUTOFF.UPLOAD, formData);
    return response;
  },

  // Get cutoff predictions
  getCutoffPredictions: async (params = {}) => {
    const queryString = new URLSearchParams(params).toString();
    const endpoint = `${API_ROUTES.CUTOFF.PREDICTIONS}?${queryString}`;
    const response = await apiClient.get(endpoint);
    return response;
  },

  // Get filter options
  getFilterOptions: async () => {
    const response = await apiClient.get(API_ROUTES.CUTOFF.FILTER_OPTIONS);
    return response;
  },

  // Get cutoff stats
  getCutoffStats: async () => {
    const response = await apiClient.get(API_ROUTES.CUTOFF.STATS);
    return response;
  },
};

export default cutoffService;