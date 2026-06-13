import { create } from 'zustand';
import apiClient from '../api/client';
import { API_ENDPOINTS } from '../api/endpoints';

export const useNotificationStore = create((set, get) => ({
  notifications: [],
  intervalId: null,

  fetchNow: async () => {
    try {
      const response = await apiClient.get(API_ENDPOINTS.NOTIFICATIONS.MINE);
      const fetchedNotifications = (response.data?.data || response.data || []).map(n => ({
        ...n,
        id: n.id,
        timestamp: n.createdAt,
        metadata: n.metadata || {}
      }));
      set({ notifications: fetchedNotifications });
    } catch (error) {
      console.error('[NotificationStore] Failed to fetch notifications:', error);
    }
  },

  // Initialize Data (No more polling!)
  listen: (userId) => {
    if (!userId) return;
    console.log(`[NotificationStore] Initial fetch for user: ${userId}`);
    get().fetchNow();
  },

  stopListening: () => {
    // Polling removed, nothing to stop
  },

  // Helper to clear notifications (frontend only, usually handled by Firestore)
  clearNotifications: () => set({ notifications: [] }),

  removeNotification: (id) => {
    // In Firestore model, we would typically update the document in DB
    // but for now we just handle local state if needed
    set((state) => ({
      notifications: state.notifications.filter(n => n.id !== id)
    }));
  }
}));

export default useNotificationStore;