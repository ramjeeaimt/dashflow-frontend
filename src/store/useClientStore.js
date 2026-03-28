import { create } from 'zustand';
import axios from 'axios';

export const useClientStore = create((set) => ({
  clients: [],
  isLoading: false,
  
  fetchClients: async () => {
    set({ isLoading: true });
    try {
      const response = await axios.get('http://localhost:3000/api/clients');
      // Fix: NestJS Interceptor ka wrapped data extract karein
      const fetchedData = response.data?.data || response.data || [];
      set({ clients: Array.isArray(fetchedData) ? fetchedData : [], isLoading: false });
    } catch (error) {
      console.error("Fetch Error:", error);
      set({ clients: [], isLoading: false });
    }
  },

  addClient: async (clientData) => {
    set({ isLoading: true });
    try {
      const response = await axios.post('http://localhost:3000/api/clients', clientData);
      
      // Fix: Naya client extract karein
      const newClient = response.data?.data || response.data;
      
      if (newClient) {
        set((state) => ({ 
          clients: [newClient, ...(Array.isArray(state.clients) ? state.clients : [])],
          isLoading: false 
        }));
      }
    } catch (error) {
      console.error("Add Client Error:", error);
      set({ isLoading: false });
      // Duplicate error handle karne ke liye
      if (error.response?.status === 500) {
        alert("This email is already registered.");
      }
    }
  },

  processInvoice: async (clientId, amount) => {
    const response = await axios.post(
      `http://localhost:3000/api/clients/${clientId}/send-invoice`, 
      { amount }
    );
    return response.data;
  },
}));