
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
    CREATE: "/api/userdata",
    GET_ALL: "/api/userdata",
    GET_BY_ID: (id) => `/api/userdata/${id}`,
    UPDATE: (id) => `/api/userdata/${id}`,
    DELETE: (id) => `/api/userdata/${id}`,
  },

  // College Predictor Routes (if needed in future)
  PREDICTOR: {
    PREDICT: "/api/predictor/predict",
    GET_COLLEGES: "/api/predictor/colleges",
    GET_COLLEGE_BY_ID: (id) => `/api/predictor/colleges/${id}`,
  },
};

export default API_ROUTES;
