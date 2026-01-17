
const API_ROUTES = {
  // Auth Routes
  AUTH: {
    SIGNUP: "/api/auth/signup",
    LOGIN: "/api/auth/login",
    ADMIN_LOGIN: "/api/auth/admin/login",
    ADMIN_SIGNUP: "/api/auth/admin/signup",
    GET_PROFILE: "/api/auth/me",
    UPDATE_PROFILE: "/api/auth/profile",
  },

  // Admin Routes
  ADMIN: {
    USERS: "/api/admin/users",
    USER_BY_ID: (userId) => `/api/admin/users/${userId}`,
    USER_STATUS: (userId) => `/api/admin/users/${userId}/status`,
    DELETE_USER: (userId) => `/api/admin/users/${userId}`,
    STATS: "/api/admin/stats",
  },

  // User Data Routes
  USER_DATA: {
    CREATE: "/api/create",
    GET_ALL: "/api/getAllUser",
    // GET_BY_ID: (id) => `/api/userdata/${id}`,
    // UPDATE: (id) => `/api/userdata/${id}`,
    // DELETE: (id) => `/api/userdata/${id}`,
  },

};

export default API_ROUTES;
