// services/analytics.service.js
import apiClient from './api';
import API_ROUTES from "../config/routes";

export const analyticsService = {
    // User Analytics
    getUserAnalytics: async () => {
        try {
            const response = await apiClient.get(API_ROUTES.ANALYTICS_ROUTER_PATH.GET_ALL_ANALYSIS_USER);
            return response.data;
        } catch (error) {
            throw error.response?.data || error.message;
        }
    },

    // Upload Data Analytics
    getUploadAnalytics: async () => {
        try {
            const response = await apiClient.get(API_ROUTES.ANALYTICS_ROUTER_PATH.UPLOAD_DATA_ANALYSIS);
            return response.data;
        } catch (error) {
            throw error.response?.data || error.message;
        }
    },

    // Assistance Analytics
    getAssistanceAnalytics: async () => {
        try {
            const response = await apiClient.get(API_ROUTES.ANALYTICS_ROUTER_PATH.ASSISTANCE_ANALYSIS);
            return response.data;
        } catch (error) {
            throw error.response?.data || error.message;
        }
    },

    // Admin Analytics
    getAdminAnalytics: async () => {
        try {
            const response = await apiClient.get(API_ROUTES.ANALYTICS_ROUTER_PATH.ADMIN_ANALYSIS);
            return response.data;
        } catch (error) {
            throw error.response?.data || error.message;
        }
    },

    
};

export default analyticsService;