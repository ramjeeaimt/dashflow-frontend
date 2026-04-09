import { create } from 'zustand';
import apiClient from '../api/client';
import { API_ENDPOINTS } from '../api/endpoints';

export const useNotificationStore = create((set, get) => ({
  notifications: [],
  intervalId: null,

  // Initialize Polling listener for REST API
  listen: (userId) => {
    if (!userId) return;
    
    // Prevent multiple listeners
    if (get().intervalId) return;

    console.log(`[NotificationStore] Starting pure polling for user: ${userId}`);

    const fetchNotifications = async () => {
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
    };

    // Fast initial fetch
    fetchNotifications();

    // Poll every 10 seconds
    const intervalId = setInterval(fetchNotifications, 10000);
    set({ intervalId });
  },

  stopListening: () => {
    const id = get().intervalId;
    if (id) {
      clearInterval(id);
      set({ intervalId: null });
    }
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