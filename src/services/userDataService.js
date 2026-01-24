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
  const url = API_ROUTES?.USER_DATA?.UPDATE_USER_BY_ADMIN_ASSISTANCE(id);
  const response = await apiClient.put(url, userData);

  return response;
},

exportUserData: async (examType = "") => {
  try {
    const url = API_ROUTES?.USER_DATA?.EXPORT_USER_DATA;
    
    console.log('📤 Export API called:', url);
    console.log('📤 Exam type:', examType);
    
    // SIMPLE: Just make the POST request
    // Don't use responseType: 'blob' - let axios handle it
    const response = await apiClient.post(url, { examType });
    
    console.log('📥 Response received');
    console.log('📥 Status:', response.status);
    console.log('📥 Headers:', response.headers);
    console.log('📥 Data type:', typeof response);
    console.log('📥 First 100 chars of data:', 
      typeof response === 'string' ? response.substring(0, 100) : 'Not a string');
    
    // Check content type
    const contentType = response.headers?.['content-type'] || '';
    console.log('📥 Content-Type:', contentType);
    
    // If it's CSV, convert to Blob
    if (contentType.includes('text/csv') || 
        (typeof response === 'string' && response.includes('Mobile Number'))) {
      
      console.log('✅ Detected CSV response');
      
      // Convert to Blob
      const data = typeof response === 'string' ? response : JSON.stringify(response);
      const blob = new Blob([data], { type: 'text/csv' });
      
      return {
        ...response,
        data: blob,
        isCsvResponse: true
      };
    }
    
    // Otherwise, assume it's JSON
    console.log('📝 Assuming JSON response');
    return {
      ...response,
      isJsonResponse: true
    };
    
  } catch (error) {
    console.error('❌ Export failed:', error);
    
    // Try to extract error message
    if (error.response?.data?.message) {
      throw new Error(error.response.data.message);
    }
    
    if (error.message) {
      throw error;
    }
    
    throw new Error('Failed to export data');
  }
},

  // // Delete user data by ID
  // deleteUserData: async (id) => {
  //   const response = await apiClient.delete(API_ROUTES.USER_DATA.DELETE(id));
  //   return response;
  // },
};

export default userDataService;
