import apiClient from '../api/client';
import { API_ENDPOINTS } from '../api/endpoints';

const financeService = {
    getSummary: async (companyId) => {
        const response = await apiClient.get(`${API_ENDPOINTS.FINANCE.BASE}/summary`, {
            params: { companyId }
        });
        return response.data;
    },
    getPayroll: async (companyId, month, year) => {
        const response = await apiClient.get(`${API_ENDPOINTS.FINANCE.BASE}/payroll`, {
            params: { companyId, month, year }
        });
        const data = response.data.data || response.data;
        return Array.isArray(data) ? data : [];
    },
    getExpenses: async (companyId) => {
        const response = await apiClient.get(`${API_ENDPOINTS.FINANCE.BASE}/expenses`, {
            params: { companyId }
        });
        const data = response.data.data || response.data;
        return Array.isArray(data) ? data : [];
    },
    createExpense: async (data) => {
        const response = await apiClient.post(`${API_ENDPOINTS.FINANCE.BASE}/expenses`, data);
        return response.data;
    },

    //create a payroll
    createPayroll: async (data) => {
        const response = await apiClient.post(
            `${API_ENDPOINTS.FINANCE.BASE}/payroll`,
            data
        );
        return response.data.data || response.data;
    },
};

export default financeService;
