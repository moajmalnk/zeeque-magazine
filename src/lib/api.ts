import axios from 'axios';

const api = axios.create({
    baseURL: import.meta.env.VITE_API_URL || '/api',
    headers: {
        'Content-Type': 'application/json',
    },
});

export default api;

// Add a request interceptor to attach the current token if it exists
api.interceptors.request.use(
    (config) => {
        const tokenString = localStorage.getItem('zeeque_auth_tokens');
        if (tokenString) {
            try {
                const { access } = JSON.parse(tokenString);
                if (access) {
                    config.headers.Authorization = `Bearer ${access}`;
                }
            } catch (e) {
                // Token invalid
                localStorage.removeItem('zeeque_auth_tokens');
            }
        }
        return config;
    },
    (error) => {
        return Promise.reject(error);
    }
);

// Response Interceptor for global error handling
api.interceptors.response.use(
    (response) => response,
    async (error) => {
        const originalRequest = error.config;

        // If error is 401 and we haven't retried yet
        if (error.response && error.response.status === 401 && !originalRequest._retry) {
            originalRequest._retry = true; // Mark as retried

            // Clear invalid credentials
            localStorage.removeItem('zeeque_auth_tokens');
            localStorage.removeItem('zeeque_user_data');

            // Remove the Authorization header from the retry
            delete originalRequest.headers['Authorization'];

            // Retry the request anonymously
            try {
                return await api(originalRequest);
            } catch (retryError) {
                return Promise.reject(retryError);
            }
        }

        return Promise.reject(error);
    }
);
