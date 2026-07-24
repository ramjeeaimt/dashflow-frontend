import apiClient from 'api/client';
import { create } from 'zustand';

export const useCompanyStore = create((set) => ({
  company: null,
  isUpdating: false,

  fetchCompany: async (id, force = false) => {
    if (!force && get().company?.id === id) {
      return;
    }
    try {
      const res = await apiClient.get(`/companies/${id}`);
      set({ company: res.data });
    } catch (err) {
      if (err.response?.status === 404) {
        console.log("Company not found, user can create a new profile.");
        set({ company: null }); 
      } else {
        console.error("Fetch error:", err);
      }
    }
  },

  // This matches the handleSave call in the component
  saveDocs: async (id, data) => {
    set({ isUpdating: true });
    try {
      const res = await apiClient.patch(`/companies/${id}`, data);
      set({ company: res.data });
      return { success: true };
    } catch (err) {
      console.error("Save error:", err);
      return { 
        success: false, 
        message: err.response?.data?.message || 'Operation failed' 
      };
    } finally {
      set({ isUpdating: false });
    }
  },
}));