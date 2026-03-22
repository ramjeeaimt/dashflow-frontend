import apiClient from '../api/client';
import { API_ENDPOINTS } from '../api/endpoints';

export const authService = {
    login: async (email, password) => {
        const response = await apiClient.post(API_ENDPOINTS.AUTH.LOGIN, { email, password });
        const resData = response.data;
        const data = resData?.data || resData;
        
        if (data.access_token) {
            localStorage.setItem('token', data.access_token);
        }
        return data;
    },

    register: async (companyData) => {
        const response = await apiClient.post(API_ENDPOINTS.AUTH.REGISTER, companyData);
        const resData = response.data;
        return resData?.data || resData;
    },

    logout: () => {
        localStorage.removeItem('token');
        localStorage.removeItem('user');
    },

    getToken: () => {
        return localStorage.getItem('token');
    },

    getProfile: async () => {
        const response = await apiClient.get(API_ENDPOINTS.AUTH.PROFILE);
        const resData = response.data;
        return resData?.data || resData;
    }
};

export default authService;
