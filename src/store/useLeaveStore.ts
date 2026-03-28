import apiClient from 'api/client';
import { API_ENDPOINTS } from 'api/endpoints';
import { create } from 'zustand';

export const useLeaveStore = create((set, get) => ({
  leaves: [],
  currentLeave: null,
  isLoading: false,
  error: null,

  // ✅ Fixed Function Name to match your component
  fetchEmployeeLeaves: async (employeeId) => {
    set({ isLoading: true });
    try {
      // API call with params for specific employee
      const response = await apiClient.get(API_ENDPOINTS.LEAVES.BASE, { 
        params: { employeeId } 
      });
      
      // NestJS Interceptor usually wraps data in a 'data' field
      // Agar log mein {"data": [...]} aa raha hai, toh response.data.data use karein
      const fetchedData = response.data.data || response.data;
      
      set({ 
        leaves: Array.isArray(fetchedData) ? fetchedData : [], 
        isLoading: false 
      });
    } catch (err) {
      set({ isLoading: false, error: 'Failed to load leaves' });
    }
  },

  submitLeave: async (data) => {
    set({ isLoading: true, error: null });
    try {
      const response = await apiClient.post(API_ENDPOINTS.LEAVES.BASE, data);
      
      // Backend se return hone wala naya leave object
      const newLeave = response.data.data || response.data;
      
      set((state) => ({ 
        leaves: [newLeave, ...state.leaves], 
        isLoading: false 
      }));
      return true;
    } catch (err) {
      set({ isLoading: false, error: err.response?.data?.message || 'Error creating leave' });
      return false;
    }
  },

// store/useLeaveStore.js
updateLeaveStatus: async (id, status, adminComment = "") => {
  set({ isLoading: true });
  try {
    const response = await apiClient.patch(API_ENDPOINTS.LEAVES.UPDATE_STATUS(id), { 
      status, 
      adminComment // Backend expects this name
    });

    // NestJS response handling
    const updatedLeave = response.data.data || response.data;

    set((state) => ({
      leaves: state.leaves.map((l) => 
        (l.id === id || l._id === id) ? { ...l, ...updatedLeave } : l
      ),
      isLoading: false,
    }));
    return true;
  } catch (err) {
    set({ isLoading: false, error: 'Failed to update' });
    return false;
  }
},

  // Helper for conflicts
  getConflict: (leave) => {
    const allLeaves = get().leaves;
    return allLeaves.find(l => 
      l.employeeId === leave.employeeId && 
      l.status === 'APPROVED' && 
      l.id !== leave.id &&
      ((leave.startDate <= l.endDate && leave.startDate >= l.startDate) || 
       (leave.endDate >= l.startDate && leave.endDate <= l.endDate))
    );
  }
}));