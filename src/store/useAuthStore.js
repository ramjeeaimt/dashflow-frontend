import { create } from 'zustand';
import authService from '../services/auth.service';

// Sanitize user data to prevent circular references
const sanitizeUser = (user) => {
    if (!user) return null;

    const roles = user.roles ? user.roles.map(role => ({
        id: role.id,
        name: role.name,
        description: role.description
    })) : [];

    // Ensure admin@difmo.com always has Admin role for UI consistency
    if (user.email === 'admin@difmo.com' && !roles.some(r => r.name === 'Admin')) {
        roles.push({ id: 'super-admin', name: 'Admin', description: 'System Administrator' });
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
            email: user.company.email
        } : null,
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
        // Prevent multiple clicks/requests while already loading
        if (get().isLoading) return;

        set({ isLoading: true, error: null });

        // Create a timeout promise to prevent indefinite hanging (especially on mobile)
        const timeoutPromise = new Promise((_, reject) => 
            setTimeout(() => reject(new Error('Login timed out. Please check your internet or server.')), 10000)
        );

        try {
            console.log(`[AuthFlow] Initiating login for: ${email}`);

            // Race the login request against the 10-second timeout
            const response = await Promise.race([
                authService.login(email, password),
                timeoutPromise
            ]);

            console.log('[AuthFlow] Login response received:', response);

            // unwrap backend response
            const payload = response.data || response;
            const accessToken = payload.access_token;
            const sanitizedUser = sanitizeUser(payload.user) || { email };

            if (accessToken) {
                localStorage.setItem('token', accessToken);
            } else {
                throw new Error('Login failed: No access token received');
            }

            localStorage.setItem('user', JSON.stringify(sanitizedUser));

            set({
                user: sanitizedUser,
                token: accessToken,
                isAuthenticated: true,
                isLoading: false
            });

            console.log('[AuthFlow] Login SUCCESS');

        } catch (error) {
            console.error('[AuthFlow] Login error:', error);

            set({
                error: error.response?.data?.message || error.message || 'Login failed',
                isLoading: false
            });

            throw error;
        }
    },

    register: async (companyData) => {
        set({ isLoading: true, error: null });
        try {
            await authService.register(companyData);
            set({ isLoading: false });
        } catch (error) {
            set({
                error: error.response?.data?.message || 'Registration failed',
                isLoading: false
            });
            throw error;
        }
    },

    fetchProfile: async () => {
        set({ isLoading: true, error: null });
        try {
            console.log('[Auth] Fetching user profile...');
            const userData = await authService.getProfile();
            console.log('[Auth] Profile fetched successfully:', userData);
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

    // Helper to check for a specific permission
    can: (action, resource) => {
        const { user } = get();
        if (!user || !user.permissions) return false;

        // Check for super admin bypass logic if applicable
        const isSuperAdmin = user.roles?.some(r => r.name === 'Super Admin' || r.name === 'Admin') || user.email === 'admin@difmo.com';
        if (isSuperAdmin) return true;

        return user.permissions.some(p => 
            p.action === action && (p.resource === resource || p.resource === 'all') ||
            p.action === 'manage' && (p.resource === resource || p.resource === 'all')
        );
    }
}));

export default useAuthStore;
