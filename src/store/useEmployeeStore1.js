// src/store/useEmployeeStore.js
import { create } from 'zustand';
import axios from 'axios';

const useEmployeeStore = create((set, get) => ({
  employees: [], // ✅ Initialize as empty array
  isLoading: false,
  error: null,

  fetchEmployees: async (companyId) => {
    set({ isLoading: true });
    try {
      const response = await axios.get(`/employees/company/${companyId}`);
      // ✅ Ensure response.data is an array
      const employeesData = Array.isArray(response.data) ? response.data : [];
      set({ employees: employeesData, isLoading: false });
      return employeesData;
    } catch (error) {
      console.error("Fetch employees error:", error);
      set({ employees: [], error: error.response?.data?.message || error.message, isLoading: false });
      throw error;
    }
  },

  addEmployee: async (employeeData, companyId) => {
    set({ isLoading: true });
    try {
      const response = await axios.post('/employees', { ...employeeData, companyId });
      set((state) => ({ 
        employees: Array.isArray(state.employees) ? [...state.employees, response.data] : [response.data], 
        isLoading: false 
      }));
      return response.data;
    } catch (error) {
      set({ error: error.response?.data?.message || error.message, isLoading: false });
      throw error;
    }
  },

  updateEmployee: async (id, employeeData) => {
    set({ isLoading: true });
    try {
      const response = await axios.put(`/employees/${id}`, employeeData);
      set((state) => ({
        employees: Array.isArray(state.employees) 
          ? state.employees.map(emp => emp.id === id ? response.data : emp)
          : [response.data],
        isLoading: false
      }));
      return response.data;
    } catch (error) {
      set({ error: error.response?.data?.message || error.message, isLoading: false });
      throw error;
    }
  },

  deleteEmployee: async (id) => {
    set({ isLoading: true });
    try {
      await axios.delete(`/employees/${id}`);
      set((state) => ({
        employees: Array.isArray(state.employees) 
          ? state.employees.filter(emp => emp.id !== id)
          : [],
        isLoading: false
      }));
    } catch (error) {
      set({ error: error.response?.data?.message || error.message, isLoading: false });
      throw error;
    }
  },

  // Reset store
  reset: () => set({ employees: [], isLoading: false, error: null })
}));

export default useEmployeeStore;