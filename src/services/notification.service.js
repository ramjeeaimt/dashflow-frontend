import apiClient from '../api/client';
import { API_ENDPOINTS } from '../api/endpoints';

export const notificationService = {
    send: async (payload) => {
        const response = await apiClient.post(API_ENDPOINTS.NOTIFICATIONS.SEND, payload);
        return response.data;
    },

    getHistory: async (companyId) => {
        const response = await apiClient.get(API_ENDPOINTS.NOTIFICATIONS.HISTORY, {
            params: { companyId }
        });
        return response.data;
    },

    getStats: async (companyId) => {
        const response = await apiClient.get(API_ENDPOINTS.NOTIFICATIONS.STATS, {
            params: { companyId }
        });
        return response.data;
    },

    markAllAsRead: async () => {
        const response = await apiClient.post(API_ENDPOINTS.NOTIFICATIONS.MARK_READ);
        return response.data;
    },

    clearAll: async () => {
        const response = await apiClient.delete(API_ENDPOINTS.NOTIFICATIONS.CLEAR);
        return response.data;
    },

    saveFcmToken: async (token, platform = 'web', deviceId = '') => {
        const response = await apiClient.post(API_ENDPOINTS.NOTIFICATIONS.FCM_TOKEN, {
            token,
            platform,
            deviceId
        });
        return response.data;
    }
};

export default notificationService;
