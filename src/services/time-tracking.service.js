import apiClient from '../api/client';
import { API_ENDPOINTS } from '../api/endpoints';

const BASE = API_ENDPOINTS.TIME_TRACKING.BASE;
const unwrap = (res) => (res?.data?.data !== undefined ? res.data.data : res?.data);

const timeTrackingService = {
    startTimer: async (data) => unwrap(await apiClient.post(`${BASE}/start`, data)),

    stopTimer: async (id, description) =>
        unwrap(await apiClient.put(`${BASE}/stop/${id}`, { description })),

    // The employee's running timer (or null).
    getActive: async (employeeId) => unwrap(await apiClient.get(`${BASE}/active/${employeeId}`)),

    // Entries for one employee, or company-wide when employeeId is omitted.
    getAll: async (employeeId, { from, to } = {}) => {
        const params = {};
        if (employeeId) params.employeeId = employeeId;
        if (from) params.from = from;
        if (to) params.to = to;
        const data = unwrap(await apiClient.get(BASE, { params }));
        return Array.isArray(data) ? data : [];
    },

    update: async (id, data) => unwrap(await apiClient.put(`${BASE}/${id}`, data)),

    remove: async (id) => unwrap(await apiClient.delete(`${BASE}/${id}`)),

    // Header roll-up (hours today/week, entries, per-day series).
    getSummary: async (employeeId) => {
        const params = {};
        if (employeeId) params.employeeId = employeeId;
        return unwrap(await apiClient.get(`${BASE}/summary`, { params }));
    },

    // Per-employee "today" view for the monitoring dashboard.
    getTeamSummary: async (companyId) =>
        unwrap(await apiClient.get(`${BASE}/team-summary`, { params: { companyId } })),
};

export default timeTrackingService;
