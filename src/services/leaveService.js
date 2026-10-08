import apiClient from "api/client";
import { API_ENDPOINTS } from "api/endpoints";

export const leaveService = {
    async create(data) {
        const response = await apiClient.post(API_ENDPOINTS.LEAVES.BASE, data);
        return response.data;
    },

    async getAll(filters = {}) {
        const response = await apiClient.get(API_ENDPOINTS.LEAVES.BASE, { params: filters });
        const resData = response.data;
        return resData?.data !== undefined ? resData.data : resData;
    },

    async getEmployeeLeaves(employeeId) {
        return await apiClient.get(API_ENDPOINTS.LEAVES.BASE, { params: { employeeId } });
    },

    // Update leave status
    async updateStatus(id, status) {
        const response = await apiClient.patch(API_ENDPOINTS.LEAVES.UPDATE_STATUS(id), { status });
        return response.data;
    },

    // Delete leave record
    async delete(id) {
        const response = await apiClient.delete(API_ENDPOINTS.LEAVES.BY_ID(id));
        return response.data;
    }
};