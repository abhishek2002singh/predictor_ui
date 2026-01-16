import apiClient from "./api";

export const authService = {
  // User signup
  signup: async (userData) => {
    const response = await apiClient.post("/api/auth/signup", userData);
    return response;
  },

  // User login
  login: async (credentials) => {
    const response = await apiClient.post("/api/auth/login", credentials);
    return response;
  },

  // Admin login
  adminLogin: async (credentials) => {
    const response = await apiClient.post("/api/auth/admin/login", credentials);
    return response;
  },

  // Admin signup (restricted)
  adminSignup: async (userData) => {
    const response = await apiClient.post("/api/auth/admin/signup", userData);
    return response;
  },

  // Get current user profile
  getProfile: async () => {
    const response = await apiClient.get("/api/auth/me");
    return response;
  },

  // Update user profile
  updateProfile: async (profileData) => {
    const response = await apiClient.put("/api/auth/profile", profileData);
    return response;
  },
};

export default authService;
