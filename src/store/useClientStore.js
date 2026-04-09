import { create } from 'zustand';
import apiClient from '../api/client';

const CLIENTS_URL = '/api/clients';

export const useClientStore = create((set, get) => ({
  clients: [],
  isLoading: false,

  fetchClients: async () => {
    set({ isLoading: true });
    try {
      const response = await apiClient.get(CLIENTS_URL);

      // Handle various wrapping layers from different backends
      let finalArray = [];
      if (response.data?.data?.data && Array.isArray(response.data.data.data)) {
        finalArray = response.data.data.data;
      } else if (response.data?.data && Array.isArray(response.data.data)) {
        finalArray = response.data.data;
      } else if (Array.isArray(response.data)) {
        finalArray = response.data;
      }

      set({ clients: finalArray, isLoading: false });
    } catch (error) {
      console.error("Fetch Clients Error:", error);
      set({ clients: [], isLoading: false });
    }
  },

  addClient: async (clientData) => {
    try {
      const response = await apiClient.post(CLIENTS_URL, clientData);
      const newClient = response.data?.data?.data || response.data?.data || response.data;
      set((state) => ({ clients: [newClient, ...state.clients] }));
      return true;
    } catch (error) {
      throw error;
    }
  },

  updateClient: async (id, updateData) => {
    try {
      const response = await apiClient.patch(`${CLIENTS_URL}/${id}`, updateData);
      const updated = response.data?.data || response.data;
      set((state) => ({
        clients: state.clients.map(c => c.id === id ? { ...c, ...updated } : c)
      }));
      return updated;
    } catch (error) {
      throw error;
    }
  },

  deleteClient: async (id) => {
    try {
      await apiClient.delete(`${CLIENTS_URL}/${id}`);
      set((state) => ({
        clients: state.clients.filter(c => c.id !== id)
      }));
      return true;
    } catch (error) {
      throw error;
    }
  },

  processInvoice: async (clientId, finalData) => {
    try {
      const res = await apiClient.post(`${CLIENTS_URL}/${clientId}/send-invoice`, finalData);
      return res.data;
    } catch (err) {
      console.error("Invoice API Error:", err.response);
      throw err;
    }
  }
}));