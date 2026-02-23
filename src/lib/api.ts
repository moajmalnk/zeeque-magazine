import axios from 'axios';

const AUTH_KEY = 'zeeque_auth_tokens';
const USER_KEY = 'zeeque_user_data';

const api = axios.create({
    baseURL: import.meta.env.VITE_API_URL || '/api',
    headers: {
        'Content-Type': 'application/json',
    },
});

export default api;

// ─── Request Interceptor ─────────────────────────────────────────────────────
// Attach the current access token to every request automatically.
api.interceptors.request.use(
    (config) => {
        const tokenString = localStorage.getItem(AUTH_KEY);
        if (tokenString) {
            try {
                const { access } = JSON.parse(tokenString);
                if (access) {
                    config.headers.Authorization = `Bearer ${access}`;
                }
            } catch {
                localStorage.removeItem(AUTH_KEY);
            }
        }
        return config;
    },
    (error) => Promise.reject(error)
);

// ─── Token Refresh Queue ──────────────────────────────────────────────────────
// Handles concurrent requests that all 401 while a refresh is in-flight.
// They are queued and replayed once a new token arrives.
let isRefreshing = false;
type QueueItem = { resolve: (token: string) => void; reject: (err: unknown) => void };
let failedQueue: QueueItem[] = [];

const processQueue = (error: unknown, newToken: string | null) => {
    failedQueue.forEach(({ resolve, reject }) => {
        if (error) reject(error);
        else resolve(newToken!);
    });
    failedQueue = [];
};

// ─── Response Interceptor ────────────────────────────────────────────────────
// On 401: silently try to exchange the refresh token for a new access token.
// Only wipe the session if the refresh token itself is invalid/expired.
api.interceptors.response.use(
    (response) => response,
    async (error) => {
        const originalRequest = error.config;

        if (!error.response || error.response.status !== 401 || originalRequest._retry) {
            return Promise.reject(error);
        }

        originalRequest._retry = true;

        // If a refresh is already happening, queue this request
        if (isRefreshing) {
            return new Promise<string>((resolve, reject) => {
                failedQueue.push({ resolve, reject });
            })
                .then((newToken) => {
                    originalRequest.headers['Authorization'] = `Bearer ${newToken}`;
                    return api(originalRequest);
                })
                .catch((err) => Promise.reject(err));
        }

        isRefreshing = true;

        const tokenString = localStorage.getItem(AUTH_KEY);
        if (!tokenString) {
            isRefreshing = false;
            return Promise.reject(error);
        }

        let refresh: string | undefined;
        try {
            refresh = JSON.parse(tokenString).refresh;
        } catch {
            isRefreshing = false;
            return Promise.reject(error);
        }

        if (!refresh) {
            isRefreshing = false;
            return Promise.reject(error);
        }

        try {
            // Exchange refresh token for a new access token
            const { data } = await axios.post(
                `${import.meta.env.VITE_API_URL || '/api'}/token/refresh/`,
                { refresh }
            );
            const newAccess: string = data.access;
            const newRefresh: string = data.refresh ?? refresh; // backend returns rotated refresh token

            // Persist both the new access AND the rotated refresh token
            const stored = JSON.parse(tokenString);
            stored.access = newAccess;
            stored.refresh = newRefresh;
            localStorage.setItem(AUTH_KEY, JSON.stringify(stored));

            // Replay all queued requests with the new token
            processQueue(null, newAccess);

            // Retry the original failed request
            originalRequest.headers['Authorization'] = `Bearer ${newAccess}`;
            return api(originalRequest);
        } catch (refreshError) {
            // Refresh token is expired or invalid — session is truly over
            processQueue(refreshError, null);
            localStorage.removeItem(AUTH_KEY);
            localStorage.removeItem(USER_KEY);
            // Redirect to login only if we're not already there
            if (!window.location.pathname.includes('/login')) {
                window.location.href = '/login';
            }
            return Promise.reject(refreshError);
        } finally {
            isRefreshing = false;
        }
    }
);
