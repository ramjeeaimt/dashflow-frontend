import apiClient from "api/client";
import { API_ENDPOINTS } from "api/endpoints";

export const leaveService = {
    async create(data) {
        // Yahan 'data' wahi hai jo LeaveForm se aa raha hai
        const response = await apiClient.post(API_ENDPOINTS.LEAVES.BASE, data);
        return response.data; // NestJS usually response object ke 'data' mein result bhejta hai
    },
    
    // Get all leaves with filters
    async getAll(filters = {}) {
        const response = await apiClient.get(API_ENDPOINTS.LEAVES.BASE, { params: filters });
        const resData = response.data;
        return resData?.data !== undefined ? resData.data : resData;
    },

    // Employee ki purani leaves dekhne ke liye (Optional but helpful)
    async getEmployeeLeaves(employeeId) {
        return await apiClient.get(API_ENDPOINTS.LEAVES.BY_EMPLOYEE(employeeId));
    },
    
};