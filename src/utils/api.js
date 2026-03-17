import axios from 'axios';

const api = axios.create({
     baseURL: 'http://localhost:3000',
   // baseURL: 'https://difmo-crm-backend.vercel.app',

    headers: {
        'Content-Type': 'application/json',
    },
});

// Add a request interceptor to include the JWT token
api.interceptors.request.use(
    (config) => {
        const token = localStorage.getItem('token');
        if (token) {
            config.headers.Authorization = `Bearer ${token}`;
            console.log('[API] Request with token:', token.substring(0, 20) + '...');
        } else {
            console.log('[API] Request without token');
        }
        return config;
    },
    (error) => Promise.reject(error)
);

// Add a response interceptor to handle 401 errors
api.interceptors.response.use(
    (response) => {
        console.log('[API] Response received:', {
            url: response.config.url,
            status: response.status,
            hasData: !!response.data,
            dataKeys: response.data ? Object.keys(response.data) : [],
            dataType: typeof response.data,
            dataIsArray: Array.isArray(response.data),
        });
        if (response.config.url?.includes('/employees')) {
            console.log('[API] Employee response data:', response.data);
        }
        return response;
    },
    (error) => {
        if (error.response?.status === 401) {
            console.error('[API] 401 Unauthorized error:', error.config.url);


            const isLoginPage = window.location.pathname.includes('/login');
            const isLoginRequest = error.config.url.includes('/auth/login');

            if (!isLoginPage && !isLoginRequest) {
                console.log('[API] Redirecting to login due to 401');
                // Clear auth data
                localStorage.removeItem('token');
                localStorage.removeItem('user');

                // Redirect to login
                setTimeout(() => {
                    window.dispatchEvent(new Event('auth:logout'));
                    window.location.href = '/login';
                }, 100);
            }
        }
        return Promise.reject(error);
    }
);

export default api;
