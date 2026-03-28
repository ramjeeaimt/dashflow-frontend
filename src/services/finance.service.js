import apiClient from '../api/client';
import { API_ENDPOINTS } from '../api/endpoints';

const financeService = {
    getSummary: async (companyId) => {
        const response = await apiClient.get(`${API_ENDPOINTS.FINANCE.BASE}/summary`, {
            params: { companyId }
        });
        return response.data;
    },
    getPayroll: async (companyId, month, year) => {
        const response = await apiClient.get(`${API_ENDPOINTS.FINANCE.BASE}/payroll`, {
            params: { companyId, month, year }
        });
        const data = response.data.data || response.data;
        return Array.isArray(data) ? data : [];
    },

    getAllLeaves: async () => {
        try {
            // Agar aapke endpoints file mein LEAVES.BASE: '/leaves' hai
            const response = await apiClient.get(API_ENDPOINTS.LEAVES.BASE);
            // NestJS aksar { data: [...] } bhejta hai, toh handle kar lo
            return response.data?.data || response.data;
        } catch (error) {
            console.error("Error in getAllLeaves Service:", error);
            throw error;
        }
    },

    updateLeaveStatus: async (leaveId, status) => {
        try {
            const response = await apiClient.patch(`${API_ENDPOINTS.LEAVES.BASE}/${leaveId}`, { 
                status // 'APPROVED' or 'REJECTED'
            });
            return response.data;
        } catch (error) {
            console.error("Error in updateLeaveStatus Service:", error);
            throw error;
        }
    },

    
    getExpenses: async (companyId) => {
        const response = await apiClient.get(`${API_ENDPOINTS.FINANCE.BASE}/expenses`, {
            params: { companyId }
        });
        const data = response.data.data || response.data;
        return Array.isArray(data) ? data : [];
    },
    createExpense: async (data) => {
        const response = await apiClient.post(`${API_ENDPOINTS.FINANCE.BASE}/expenses`, data);
        return response.data;
    },

    //create a payroll
    createPayroll: async (data) => {
        const response = await apiClient.post(
            `${API_ENDPOINTS.FINANCE.BASE}/payroll`,
            data
        );
        return response.data.data || response.data;
    },

   getEmployeePayrolls: async (employeeId) => {

  const res = await apiClient.get("/finance/payroll", {
    params: { employeeId }
  });
  console.log("USER ID", user.id)

console.log("EMPLOYEE ID", employeeId)

  return res.data.data || res.data;
},

 
  

  getPayrollById: async (id) => {
    const res = await apiClient.get(`/payroll/${id}`);
    return res.data;
  },
  
};

export default financeService;
