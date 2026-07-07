import { create } from 'zustand';
import authService from '../services/auth.service';
import { ROLES, isSystemAdmin, canUser } from '../config/roles';

const sanitizeUser = (user) => {
    if (!user) return null;

    const roles = user.roles ? user.roles.map(role => ({
        id: role.id,
        name: role.name,
        description: role.description
    })) : [];

    if (isSystemAdmin(user) && !roles.some(r => r.name?.toUpperCase() === 'ADMIN')) {
        roles.push({ id: 'super-admin', name: ROLES.ADMIN, description: 'System Administrator' });
    }

    return {
        id: user.id,
        email: user.email,
        firstName: user.firstName,
        lastName: user.lastName,
        phone: user.phone,
        isActive: user.isActive,
        roles: roles,
        company: user.company ? {
            id: user.company.id,
            name: user.company.name,
            email: user.company.email,
            attendanceAlertEmails: user.company.attendanceAlertEmails
        } : null,
        companies: (user.companies || []).map(c => ({
            id: c.id,
            name: c.name,
            email: c.email,
            attendanceAlertEmails: c.attendanceAlertEmails
        })),
        permissions: user.permissions || []
    };
};

// Initialize state from localStorage
const getInitialState = () => {
    const token = localStorage.getItem('token');
    const userStr = localStorage.getItem('user');
    let user = null;

    if (token && userStr) {
        try {
            user = JSON.parse(userStr);
        } catch (e) {
            console.error('Failed to parse user data from localStorage:', e);
            localStorage.removeItem('user');
        }
    } else {
        // If no token, ensure no user is set
        user = null;
        if (userStr) localStorage.removeItem('user');
    }

    return {
        user,
        token,
        isAuthenticated: !!token,
    };
};

const useAuthStore = create((set, get) => ({
    ...getInitialState(),
    isLoading: false,
    error: null,

    login: async (email, password) => {
        if (get().isLoading) return;

        set({ isLoading: true, error: null });
        const timeoutPromise = new Promise((_, reject) =>
            setTimeout(() => reject(new Error('Login timed out. Please check your internet or server.')), 10000)
        );

        try {

            // Race the login request against the 10-second timeout
            const response = await Promise.race([
                authService.login(email, password),
                timeoutPromise
            ]);


            // unwrap backend response
            const payload = response.data || response;
            const accessToken = payload.access_token;
            const sanitizedUser = sanitizeUser(payload.user) || { email };

            if (accessToken) {
                localStorage.setItem('token', accessToken);
            } else {
                throw new Error('Could not complete login. Please try again or contact support.');
            }

            localStorage.setItem('user', JSON.stringify(sanitizedUser));

            set({
                user: sanitizedUser,
                token: accessToken,
                isAuthenticated: true,
                isLoading: false
            });


        } catch (error) {
            console.error('[AuthFlow] Login error:', error);

            let errorMessage = 'Login failed';

            if (error.response?.data?.message) {
                const backendMessage = error.response.data.message;
                errorMessage = Array.isArray(backendMessage) ? backendMessage[0] : backendMessage;
            } else if (error.message) {
                errorMessage = error.message;
            }

            set({
                error: errorMessage,
                isLoading: false
            });

            throw error;
        }
    },

    register: async (companyData) => {
        set({ isLoading: true, error: null });
        try {
            const response = await authService.register(companyData);

            // Auto-login after registration
            const payload = response.data || response;
            const accessToken = payload.access_token;
            const sanitizedUser = sanitizeUser(payload.user);

            if (accessToken) {
                localStorage.setItem('token', accessToken);
            }

            if (sanitizedUser) {
                localStorage.setItem('user', JSON.stringify(sanitizedUser));
            }

            set({
                user: sanitizedUser,
                token: accessToken,
                isAuthenticated: !!accessToken,
                isLoading: false
            });

            return response;
        } catch (error) {
            set({
                error: error.response?.data?.message || 'Registration failed',
                isLoading: false
            });
            throw error;
        }
    },

    switchCompany: async (companyId) => {
        set({ isLoading: true, error: null });
        try {
            const response = await authService.switchCompany(companyId);
            const payload = response.data || response;
            const accessToken = payload.access_token;
            const sanitizedUser = sanitizeUser(payload.user);

            if (accessToken) {
                localStorage.setItem('token', accessToken);
            }
            localStorage.setItem('user', JSON.stringify(sanitizedUser));

            set({
                user: sanitizedUser,
                token: accessToken,
                isAuthenticated: true,
                isLoading: false
            });

            // Reload to refresh all state based on new company
            window.location.href = '/dashboard';
        } catch (error) {
            set({
                error: error.response?.data?.message || 'Switching company failed',
                isLoading: false
            });
            throw error;
        }
    },

    fetchProfile: async () => {
        set({ isLoading: true, error: null });
        try {
            const userData = await authService.getProfile();
            const sanitizedUser = sanitizeUser(userData);

            // Save sanitized user data to localStorage
            localStorage.setItem('user', JSON.stringify(sanitizedUser));

            set({ user: sanitizedUser, isAuthenticated: true, isLoading: false });
        } catch (error) {
            console.error('[Auth] Failed to fetch profile:', error);
            console.error('[Auth] Error response:', error.response);
            console.error('[Auth] Error message:', error.message);

            // If profile fetch fails (e.g., 401), logout
            set({ user: null, token: null, isAuthenticated: false, isLoading: false, error: 'Session expired' });
            localStorage.removeItem('token');
            localStorage.removeItem('user');
        }
    },

    logout: () => {
        authService.logout();
        localStorage.removeItem('user');
        set({ user: null, token: null, isAuthenticated: false });
    },

    clearError: () => set({ error: null }),

    // Helper to check for a specific permission — policy lives in src/config/roles.js
    can: (action, resource) => canUser(get().user, action, resource)
}));

export default useAuthStore;
