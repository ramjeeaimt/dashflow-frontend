import axios from 'axios';

const apiClient = axios.create({
 baseURL : "https://difmo-crm-backend.vercel.app",
 //baseURL: 'http://localhost:3000',
    // baseURL: import.meta.env.VITE_API_URL || 'http://localhost:4000',
    headers: {
        'Content-Type': 'application/json',
    },
});

// Request interceptor: add auth token
apiClient.interceptors.request.use(
    (config) => {
        const token = localStorage.getItem('token');
        if (token) {
            config.headers.Authorization = `Bearer ${token}`;
        }
        return config;
    },
    (error) => Promise.reject(error)
);

apiClient.interceptors.response.use(
    (response) => response,
    (error) => {
        if (error.response?.status === 401) {
            const isLoginPage = window.location.pathname.includes('/login');
            const isLoginRequest = error.config.url.includes('/auth/login');

            if (!isLoginPage && !isLoginRequest) {
                localStorage.removeItem('token');
                localStorage.removeItem('user');

                // Trigger logout event or redirect
                window.dispatchEvent(new Event('auth:logout'));
                window.location.href = '/login';
            }
        }
        return Promise.reject(error);
    }
);

export default apiClient;
