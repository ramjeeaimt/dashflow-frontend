import React, { useEffect } from "react";
import Routes from "./Routes";
import useAuthStore from "./store/useAuthStore";
import useNotificationStore from "./store/useNotificationStore";

function App() {
  const { fetchProfile, token, user, isLoading } = useAuthStore();
  const { listen, stopListening } = useNotificationStore();

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
      <Routes />
    </div>
  );
}

export default App;
