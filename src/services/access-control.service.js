import apiClient from '../api/client';
import { API_ENDPOINTS } from '../api/endpoints';

export const accessControlService = {
    async getAllRoles(companyId) {
        const response = await apiClient.get(`${API_ENDPOINTS.ACCESS_CONTROL.BASE}/roles`, { 
            params: { companyId } 
        });
        const data = response.data.data || response.data;
        return Array.isArray(data) ? data : [];
    },

    async getRoleById(id) {
        const response = await apiClient.get(`${API_ENDPOINTS.ACCESS_CONTROL.BASE}/roles/${id}`);
        return response.data.data || response.data;
    },

    async createRole(roleData) {
        const response = await apiClient.post(`${API_ENDPOINTS.ACCESS_CONTROL.BASE}/roles`, roleData);
        return response.data.data || response.data;
    },

    async updateRole(id, roleData) {
        const response = await apiClient.put(`${API_ENDPOINTS.ACCESS_CONTROL.BASE}/roles/${id}`, roleData);
        return response.data.data || response.data;
    },

    async getAllPermissions() {
        const response = await apiClient.get(`${API_ENDPOINTS.ACCESS_CONTROL.BASE}/permissions`);
        const data = response.data.data || response.data;
        return Array.isArray(data) ? data : [];
    },

    async seedPermissions() {
        const response = await apiClient.post(`${API_ENDPOINTS.ACCESS_CONTROL.BASE}/seed`);
        return response.data;
    },

    async deleteRole(id) {
        const response = await apiClient.delete(`${API_ENDPOINTS.ACCESS_CONTROL.BASE}/roles/${id}`);
        return response.data;
    }
};

export default accessControlService;
