import apiClient from '../api/client';
import { API_ENDPOINTS } from '../api/endpoints';

export const employeeService = {
    // Get all employees with optional filters
    async getAll(filters = {}) {
        console.log("Employee filters:", filters);
        let params = {};
        if (typeof filters === 'string' || typeof filters === 'number') {
            params = { companyId: filters };
        } else if (filters && typeof filters === 'object') {
            params = filters;
        }
        const response = await apiClient.get(API_ENDPOINTS.EMPLOYEES.BASE, { params });
        const resData = response.data;
        const data = resData?.data !== undefined ? resData.data : resData;

        // Ensure we always return an array
        return Array.isArray(data) ? data : [];
    },

    // Get single employee by ID
    async getById(id) {
        const response = await apiClient.get(API_ENDPOINTS.EMPLOYEES.BY_ID(id));
        const resData = response.data;
        return resData?.data !== undefined ? resData.data : resData;
    },

    // Create new employee
    async create(employeeData) {
        const response = await apiClient.post(API_ENDPOINTS.EMPLOYEES.BASE, employeeData);
        const resData = response.data;
        return resData?.data !== undefined ? resData.data : resData;
    },

    // Update employee
    async update(id, employeeData) {
        const response = await apiClient.put(API_ENDPOINTS.EMPLOYEES.BY_ID(id), employeeData);
        const resData = response.data;
        return resData?.data !== undefined ? resData.data : resData;
    },

    // Delete employee
    async delete(id) {
        const response = await apiClient.delete(API_ENDPOINTS.EMPLOYEES.BY_ID(id));
        return response.data;
    },

    // Get employee count
    async getCount(companyId) {
        const response = await apiClient.get(`${API_ENDPOINTS.EMPLOYEES.BASE}/stats/count`, {
            params: { companyId }
        });
        const resData = response.data;
        return resData?.data !== undefined ? resData.data : resData;
    },



    // Search employees
    async search(searchTerm, filters = {}) {
        const response = await apiClient.get(API_ENDPOINTS.EMPLOYEES.BASE, {
            params: { search: searchTerm, ...filters }
        });
        const resData = response.data;
        return resData?.data !== undefined ? resData.data : resData;
    }
};

export default employeeService;
