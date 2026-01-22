import axios from 'axios';

const api = axios.create({
    baseURL: '/api/v1',
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
