import React, { useEffect } from "react";
import Routes from "./Routes";
import useAuthStore from "./store/useAuthStore";
import useNotificationStore from "./store/useNotificationStore";
import usePushNotifications from "./hooks/usePushNotifications";

import { Toaster } from "react-hot-toast";

function App() {
  const { fetchProfile, token, user, isLoading } = useAuthStore();
  const { listen, stopListening } = useNotificationStore();

  // Initialize Push Notifications (handles permission & FCM token syncing automatically)
  usePushNotifications(user?.id);

  useEffect(() => {
    if (token) {
      fetchProfile();
    }
  }, [token, fetchProfile]);

  useEffect(() => {
    if (user?.id) {
      listen(user.id);
    }
    return () => {
      stopListening();
    };
  }, [user?.id, listen, stopListening]);

  // Global event listener to restrict number inputs
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.target.tagName.toLowerCase() === 'input' && e.target.type === 'number') {
        // Prevent typing 'e', 'E', '+', '-'
        if (['e', 'E', '+', '-'].includes(e.key)) {
          e.preventDefault();
        }
      }
    };

    const handleWheel = (e) => {
      if (e.target.tagName.toLowerCase() === 'input' && e.target.type === 'number') {
        // Prevent scrolling to change numbers
        e.target.blur();
      }
    };

    document.addEventListener('keydown', handleKeyDown);
    // Use capture phase to ensure we catch it before it changes the value
    document.addEventListener('wheel', handleWheel, { passive: false, capture: true });

    return () => {
      document.removeEventListener('keydown', handleKeyDown);
      document.removeEventListener('wheel', handleWheel, { capture: true });
    };
  }, []);

  // Show loading screen while fetching profile on initial load
  if (token && !user && isLoading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
          <p className="mt-4 text-muted-foreground">Loading...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="professional-ui">
      <Toaster />
      <Routes />
    </div>
  );
}

export default App;
