import apiClient from "./api";
import API_ROUTES from "../config/routes";

export const adminService = {
  // Get all users with pagination and filters
  getUsers: async (params = {}) => {
    const queryString = new URLSearchParams(params).toString();
    const endpoint = queryString ? `${API_ROUTES.ADMIN.USERS}?${queryString}` : API_ROUTES.ADMIN.USERS;
    const response = await apiClient.get(endpoint);
    return response;
  },

  // Get single user by ID
  getUser: async (userId) => {
    const response = await apiClient.get(API_ROUTES.ADMIN.USER_BY_ID(userId));
    return response;
  },

  // Update user status (activate/deactivate)
  updateUserStatus: async (userId, isActive) => {
    const response = await apiClient.put(API_ROUTES.ADMIN.USER_STATUS(userId), {
      isActive,
    });
    return response;
  },

  // Delete user
  deleteUser: async (userId) => {
    const response = await apiClient.delete(API_ROUTES.ADMIN.DELETE_USER(userId));
    return response;
  },

  // Get dashboard stats
  getStats: async () => {
    const response = await apiClient.get(API_ROUTES.ADMIN.STATS);
    return response;
  },
};

export default adminService;
