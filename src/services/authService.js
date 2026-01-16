import apiClient from "./api";
import API_ROUTES from "../config/routes";

export const authService = {
  // User signup
  signup: async (userData) => {
    const response = await apiClient.post(API_ROUTES.AUTH.SIGNUP, userData);
    return response;
  },

  // User login
  login: async (credentials) => {
    const response = await apiClient.post(API_ROUTES.AUTH.LOGIN, credentials);
    return response;
  },

  // Admin login
  adminLogin: async (credentials) => {
    const response = await apiClient.post(API_ROUTES.AUTH.ADMIN_LOGIN, credentials);
    return response;
  },

  // Admin signup (restricted)
  adminSignup: async (userData) => {
    const response = await apiClient.post(API_ROUTES.AUTH.ADMIN_SIGNUP, userData);
    return response;
  },

  // Get current user profile
  getProfile: async () => {
    const response = await apiClient.get(API_ROUTES.AUTH.GET_PROFILE);
    return response;
  },

  // Update user profile
  updateProfile: async (profileData) => {
    const response = await apiClient.put(API_ROUTES.AUTH.UPDATE_PROFILE, profileData);
    return response;
  },
};

export default authService;
