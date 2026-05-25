import apiClient from '../api/client';
import { API_ENDPOINTS } from '../api/endpoints';

export const overtimeService = {
  async createRequest({ date, hours, description }) {
    const response = await apiClient.post(API_ENDPOINTS.OVERTIME.CREATE, {
      date,
      hours,
      description,
    });
    const resData = response.data;
    return resData?.data !== undefined ? resData.data : resData;
  },
};

export default overtimeService;
