// config/routes.js - Fix this file
const API_ROUTES = {
  // Auth Routes
  AUTH: {
    SIGNUP: "/api/auth/signup",
    LOGIN: "/api/auth/login",
    ADMIN_LOGIN: "/api/auth/admin/login",
    ADMIN_SIGNUP: "/api/auth/admin/signup",
    ASSISTANT_LOGIN: "/api/auth/assistant/login",
    GET_PROFILE: "/api/auth/me",
    UPDATE_PROFILE: "/api/auth/profile",
  },

  // Admin Routes
  ADMIN: {
    USERS: "/api/admin/AllAdmin",
    USER_BY_ID: (userId) => `/api/admin/users/${userId}`,
    USER_STATUS: (userId) => `/api/admin/users/${userId}/status`,
    DELETE_USER: (userId) => `/api/admin/users/${userId}`,
    STATS: "/api/admin/stats",
  },

  // User Data Routes
  USER_DATA: {
    CREATE: "/api/create",
    GET_ALL: "/api/getAllUser",
  },

  // Assistant Routes
  ASSISTANT: {
    CREATE: "/api/assistant/create",
    GET_ALL: "/api/assistant/allAssistance",
    GET_BY_ID: (id) => `/api/assistant/${id}`,
    UPDATE_PERMISSIONS: (id) => `/api/assistant/${id}/permissions`,
    UPDATE_STATUS: (id) => `/api/assistant/${id}/status`,
    DELETE: (id) => `/api/assistant/${id}`,
    MY_PERMISSIONS: "/api/assistant/my-permissions",
  },

  // Fix the cutoff upload route
  CUTOFF: {
    UPLOAD: "/api/cutoff/upload",
    PREDICTIONS: "/api/cutoff/predictions",
    FILTER_OPTIONS: "/api/cutoff/filter-options",
    STATS: "/api/cutoff/stats",
  }
};

export default API_ROUTES;