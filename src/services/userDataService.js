import apiClient from "./api";
import API_ROUTES from "../config/routes";

export const userDataService = {
  // Create new user data
  createUserData: async (userData) => {
    const response = await apiClient.post(API_ROUTES.USER_DATA.CREATE, userData);
    return response;
  },

  // Get all user data with pagination and filters
  getAllUserData: async (params = {}) => {
    const queryString = new URLSearchParams(params).toString();
    const endpoint = queryString ? `${API_ROUTES.USER_DATA.GET_ALL}?${queryString}` : API_ROUTES.USER_DATA.GET_ALL;
    const response = await apiClient.get(endpoint);
    return response;
  },

  // Get single user data by ID
  // getUserData: async (id) => {
  //   const response = await apiClient.get(API_ROUTES.USER_DATA.GET_BY_ID(id));
  //   return response;
  // },

  // Update user data by ID
updateUserData: async (id, userData) => {
  console.log("Sending update data:", userData); // Add this
  console.log("User ID:", id); // Add this
  const url = API_ROUTES.USER_DATA.UPDATE_USER_BY_ADMIN_ASSISTANCE(id);
  const response = await apiClient.put(url, userData);
  console.log("Response from server:", response); // Add this
  return response;
}

  // // Delete user data by ID
  // deleteUserData: async (id) => {
  //   const response = await apiClient.delete(API_ROUTES.USER_DATA.DELETE(id));
  //   return response;
  // },
};

export default userDataService;
