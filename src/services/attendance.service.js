import apiClient from '../api/client';
import { API_ENDPOINTS } from '../api/endpoints';

export const attendanceService = {
    // Check in
    async checkIn(employeeId, location = '', notes = '', latitude = null, longitude = null) {
        const response = await apiClient.post(API_ENDPOINTS.ATTENDANCE.CHECK_IN, {
            employeeId,
            location,
            notes,
            latitude,
            longitude
        });
        const resData = response.data;
        return resData?.data !== undefined ? resData.data : resData;
    },

    // Bulk Check-in
    async bulkCheckIn(employeeIds, notes = '') {
        const response = await apiClient.post(API_ENDPOINTS.ATTENDANCE.BULK_CHECK_IN, {
            employeeIds,
            notes
        });
        const resData = response.data;
        return resData?.data !== undefined ? resData.data : resData;
    },

    // Check out
    async checkOut(attendanceId, notes = '', latitude = null, longitude = null) {
        const response = await apiClient.post(API_ENDPOINTS.ATTENDANCE.CHECK_OUT, {
            attendanceId,
            notes,
            latitude,
            longitude
        });
        const resData = response.data;
        return resData?.data !== undefined ? resData.data : resData;
    },

    // Get all attendance records with filters
    async getAll(filters = {}) {
        const response = await apiClient.get(API_ENDPOINTS.ATTENDANCE.BASE, { params: filters });
        const resData = response.data;
        const data = resData?.data !== undefined ? resData.data : resData;
        return Array.isArray(data) ? data : [];
    },

    // Get attendance by ID
    async getById(id) {
        const response = await apiClient.get(`${API_ENDPOINTS.ATTENDANCE.BASE}/${id}`);
        const resData = response.data;
        return resData?.data !== undefined ? resData.data : resData;
    },

    // Get today's attendance for an employee
    async getTodayAttendance(employeeId) {
        const response = await apiClient.get(API_ENDPOINTS.ATTENDANCE.TODAY(employeeId));
        const resData = response.data;
        return resData?.data !== undefined ? resData.data : resData;
    },

    // Get attendance analytics
    async getAnalytics(filters = {}) {
        const response = await apiClient.get(API_ENDPOINTS.ATTENDANCE.ANALYTICS, { params: filters });
        const resData = response.data;
        return resData?.data !== undefined ? resData.data : resData;
    },

    // Create manual attendance record
    async create(attendanceData) {
        const response = await apiClient.post(API_ENDPOINTS.ATTENDANCE.BASE, attendanceData);
        const resData = response.data;
        return resData?.data !== undefined ? resData.data : resData;
    },

    // Get attendance for date range
    async getByDateRange(startDate, endDate, employeeId = null) {
        const params = { startDate, endDate };
        if (employeeId) {
            params.employeeId = employeeId;
        }
        const response = await apiClient.get(API_ENDPOINTS.ATTENDANCE.BASE, { params });
        const resData = response.data;
        const data = resData?.data !== undefined ? resData.data : resData;
        return Array.isArray(data) ? data : [];
    },

    // Update attendance record
    async update(id, attendanceData) {
        const response = await apiClient.patch(`${API_ENDPOINTS.ATTENDANCE.BASE}/${id}`, attendanceData);
        const resData = response.data;
        return resData?.data !== undefined ? resData.data : resData;
    }
};

export default attendanceService;
