import apiClient from "api/client";
import { API_ENDPOINTS } from "api/endpoints";

export const leaveService = {
    async create(data) {
        // Yahan 'data' wahi hai jo LeaveForm se aa raha hai
        const response = await apiClient.post(API_ENDPOINTS.LEAVES.BASE, data);
        return response.data; // NestJS usually response object ke 'data' mein result bhejta hai
    },
    
    // Employee ki purani leaves dekhne ke liye (Optional but helpful)
    async getEmployeeLeaves(employeeId) {
        return await apiClient.get(API_ENDPOINTS.LEAVES.BY_EMPLOYEE(employeeId));
    },
    
};