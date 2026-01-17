import apiClient from "./api";
import API_ROUTES from "../config/routes";

const assistantService = {
  // Create a new assistant
  createAssistant: async (assistantData) => {
    return apiClient.post(API_ROUTES.ASSISTANT.CREATE, assistantData);
  },

  // Get all assistants with pagination
  getAllAssistants: async (page = 1, limit = 10, search = "") => {
    const params = new URLSearchParams({ page, limit });
    if (search) params.append("search", search);
    return apiClient.get(`${API_ROUTES.ASSISTANT.GET_ALL}?${params}`);
  },

  // Get single assistant by ID
  getAssistantById: async (id) => {
    return apiClient.get(API_ROUTES.ASSISTANT.GET_BY_ID(id));
  },

  // Update assistant permissions
  updatePermissions: async (id, permissions) => {
    return apiClient.put(API_ROUTES.ASSISTANT.UPDATE_PERMISSIONS(id), permissions);
  },

  // Update assistant status (activate/deactivate)
  updateStatus: async (id, isActive) => {
    return apiClient.put(API_ROUTES.ASSISTANT.UPDATE_STATUS(id), { isActive });
  },

  // Delete assistant
  deleteAssistant: async (id) => {
    return apiClient.delete(API_ROUTES.ASSISTANT.DELETE(id));
  },

  // Get current assistant's permissions
  getMyPermissions: async () => {
    return apiClient.get(API_ROUTES.ASSISTANT.MY_PERMISSIONS);
  },
};

export default assistantService;
