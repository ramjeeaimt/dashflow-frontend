import { useEffect, useCallback } from 'react';
import { messaging, getToken, onMessage, VAPID_KEY } from '../firebase';
import notificationService from '../services/notification.service';
import toast from 'react-hot-toast';
import useNotificationStore from '../store/useNotificationStore';

export const usePushNotifications = (userId) => {

    const requestAndSaveToken = useCallback(async () => {
        if (!userId) return;

        try {
            // Check if browser supports notifications
            if (!('Notification' in window)) {
                console.warn('This browser does not support desktop notifications');
                return;
            }

            // Request permission
            const permission = await Notification.requestPermission();
            if (permission !== 'granted') {
                console.warn('Notification permission not granted.');
                return;
            }

            // Generate Token
            if (messaging) {
                const token = await getToken(messaging, { vapidKey: VAPID_KEY });
                if (token) {
                    console.log('FCM Token Generated successfully');

                    // Send to backend
                    await notificationService.saveFcmToken(token, 'web', navigator.userAgent);
                    
                    // Save locally so we can delete it on logout
                    localStorage.setItem('fcm_token', token);
                } else {
                    console.warn('No registration token available.');
                }
            }
        } catch (error) {
            console.error('An error occurred while retrieving token:', error);
        }
    }, [userId]);

    useEffect(() => {
        if (userId) {
            requestAndSaveToken();
        }
    }, [userId, requestAndSaveToken]);

    // Handle Foreground Notifications
    useEffect(() => {
        if (!messaging) return;

        const unsubscribe = onMessage(messaging, (payload) => {
            console.log('Received foreground message: ', payload);

            //  Reactively fetch the latest notifications for the UI dropdown!
            useNotificationStore.getState().fetchNow();

            // Display a custom toast when a push notification is received while app is open
            if (payload.notification) {
                toast(
                    (t) => (
                        <div className="flex flex-col relative w-full pr-4">
                            <button
                                onClick={() => toast.dismiss(t.id)}
                                className="absolute -top-1 -right-2 text-gray-400 hover:text-gray-600 focus:outline-none p-1 rounded-full hover:bg-gray-100 transition-colors"
                                aria-label="Close notification"
                            >
                                <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
                                </svg>
                            </button>
                            <span className="font-semibold text-gray-900 pr-2">{payload.notification.title}</span>
                            <span className="text-sm text-gray-600 mt-1">{payload.notification.body}</span>
                        </div>
                    ),
                    {
                        duration: 5000,
                        position: 'top-right',
                        style: {
                            border: '1px solid #E5E7EB',
                            padding: '16px',
                            color: '#111827',
                            boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)',
                        },
                    }
                );
            }
        });

        return () => {
            unsubscribe();
        };
    }, []);

    return { requestAndSaveToken };
};

export default usePushNotifications;
