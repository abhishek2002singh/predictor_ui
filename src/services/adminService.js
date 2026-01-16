import apiClient from "./api";

export const adminService = {
  // Get all users with pagination and filters
  getUsers: async (params = {}) => {
    const queryString = new URLSearchParams(params).toString();
    const endpoint = queryString ? `/api/admin/users?${queryString}` : "/api/admin/users";
    const response = await apiClient.get(endpoint);
    return response;
  },

  // Get single user by ID
  getUser: async (userId) => {
    const response = await apiClient.get(`/api/admin/users/${userId}`);
    return response;
  },

  // Update user status (activate/deactivate)
  updateUserStatus: async (userId, isActive) => {
    const response = await apiClient.put(`/api/admin/users/${userId}/status`, {
      isActive,
    });
    return response;
  },

  // Delete user
  deleteUser: async (userId) => {
    const response = await apiClient.delete(`/api/admin/users/${userId}`);
    return response;
  },

  // Get dashboard stats
  getStats: async () => {
    const response = await apiClient.get("/api/admin/stats");
    return response;
  },
};

export default adminService;
