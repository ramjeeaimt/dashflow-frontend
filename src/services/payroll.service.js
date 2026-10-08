import apiClient from "../api/client";
import { API_ENDPOINTS } from "../api/endpoints";

const payrollService = {
  getEmployeePayrolls: async (employeeId) => {
    const res = await apiClient.get(`${API_ENDPOINTS.FINANCE.BASE}/payroll`, {
      params: { employeeId }
    });
    return res.data?.data || res.data;
  },

  getPayrollById: async (id) => {
    const res = await apiClient.get(`${API_ENDPOINTS.FINANCE.BASE}/payroll/${id}`);
    return res.data?.data || res.data;
  }
};

export default payrollService;