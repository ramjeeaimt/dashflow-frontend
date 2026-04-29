import apiClient from '../api/client';

const CLIENTS_URL = '/api/clients';

export const clientService = {
    async getAll() {
        const response = await apiClient.get(CLIENTS_URL);
        const data = response.data?.data ?? response.data;
        return Array.isArray(data) ? data : [];
    }
};

export default clientService;
