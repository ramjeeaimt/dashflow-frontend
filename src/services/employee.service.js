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
        const data = response.data.data || response.data;
        // Ensure we always return an array
        return Array.isArray(data) ? data : [];
    },

    // Get single employee by ID
    async getById(id) {
        const response = await apiClient.get(API_ENDPOINTS.EMPLOYEES.BY_ID(id));
        return response.data.data || response.data;
    },

    // Create new employee
    async create(employeeData) {
        const response = await apiClient.post(API_ENDPOINTS.EMPLOYEES.BASE, employeeData);
        return response.data.data || response.data;
    },

    // Update employee
    async update(id, employeeData) {
        const response = await apiClient.put(API_ENDPOINTS.EMPLOYEES.BY_ID(id), employeeData);
        return response.data.data || response.data;
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
        return response.data.data || response.data;
    },

    // Search employees
    async search(searchTerm, filters = {}) {
        const response = await apiClient.get(API_ENDPOINTS.EMPLOYEES.BASE, {
            params: { search: searchTerm, ...filters }
        });
        return response.data.data || response.data;
    }
};

export default employeeService;
