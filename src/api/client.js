import axios from 'axios';
// Create an Axios instance with the base URL of the backend API
const apiClient = axios.create({
    baseURL: 'https://difmo-crm-backend-2uwg.onrender.com/api',
    headers: {
        'Content-Type': 'application/json',
    },
});

// Request 
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
    (response) => {
        // If the backend has wrapped the data in a 'data' property (via TransformInterceptor), unwrap it
        // Backend wraps as: { data: <actual data>, statusCode, message }
        // We need to extract response.data.data (the actual array or object)
        if (response.data && typeof response.data === 'object' && response.data.statusCode && response.data.message) {
            // This is a wrapped response, unwrap the data property
            return {
                ...response,
                data: response.data.data
            };
        }
        return response;
    },
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
