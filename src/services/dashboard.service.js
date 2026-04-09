import apiClient from '../api/client';
import { API_ENDPOINTS } from '../api/endpoints';

const dashboardService = {
    getMetrics: async (companyId, userId) => {
        const response = await apiClient.get(API_ENDPOINTS.DASHBOARD.STATS, {
            params: { companyId, userId }
        });
        const resData = response.data;
        return resData?.data !== undefined ? resData.data : resData;
    },
    getCharts: async (companyId) => {
        const response = await apiClient.get(API_ENDPOINTS.DASHBOARD.CHARTS, {
            params: { companyId }
        });
        const resData = response.data;
        return resData?.data !== undefined ? resData.data : resData;
    },
    getFeed: async (companyId, userId) => {
        const response = await apiClient.get(API_ENDPOINTS.DASHBOARD.FEED, {
            params: { companyId, userId }
        });
        const resData = response.data;
        return resData?.data !== undefined ? resData.data : resData;
    },
    getFinancials: async (companyId) => {
        const response = await apiClient.get(API_ENDPOINTS.DASHBOARD.FINANCIALS, {
            params: { companyId }
        });
        const resData = response.data;
        return resData?.data !== undefined ? resData.data : resData;
    }
};

export default dashboardService;
