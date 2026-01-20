
import apiClient from './api';

export const predictorApi = {
  getCutoffs: (params) => apiClient.get('/api/predictions', { params }),
  createUserData: (data) => apiClient.post('/api/create', data),
  updateUserData: (id, data) => apiClient.put(`/api/update/${id}`, data),
  
};