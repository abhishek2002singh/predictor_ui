// services/rankPrediction.service.js
import apiClient from './api';
import API_ROUTES from "../config/routes";

export const rankPredictionService = {
    // Get rank prediction for college
    getRankPrediction: async (data) => {
        try {
            const response = await apiClient.post(
                API_ROUTES.RANK_PREDICTION_ROUTER_PATH.GET_RANK_PREDICTION, 
                data
            );
            return response;
        } catch (error) {
            throw error.response?.data || error.message;
        }
    },

    userDetailsFromRankPredictions: async(data) =>{
        try{
            const url = API_ROUTES?.RANK_PREDICTION_ROUTER_PATH?.USER_PREDICTION_FROM_RANK_PREDICTION
            const response = await apiClient.post(url , data)
            return response

        }catch (error) {
            throw error.response?.data || error.message;
        }
    }
};

export default rankPredictionService;