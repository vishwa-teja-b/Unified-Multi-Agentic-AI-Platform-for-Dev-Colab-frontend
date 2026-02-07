import axios from 'axios';

const api = axios.create({
    baseURL: process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000',
    headers: {
        'Content-Type': 'application/json',
    },
});

export const setAuthData = (accessToken: string, refreshToken: string, userId: string) => {
    if (typeof window !== 'undefined') {
        localStorage.setItem('access_token', accessToken);
        localStorage.setItem('refresh_token', refreshToken);
        localStorage.setItem('user_id', userId);
    }
};

export const clearAuthData = () => {
    if (typeof window !== 'undefined') {
        localStorage.removeItem('access_token');
        localStorage.removeItem('refresh_token');
        localStorage.removeItem('user_id');
    }
};

// Request interceptor
api.interceptors.request.use(
    (config) => {
        const token = typeof window !== 'undefined' ? localStorage.getItem('access_token') : null;
        if (token) {
            config.headers.Authorization = `Bearer ${token}`;
        }
        return config;
    },
    (error) => Promise.reject(error)
);

// Response interceptor
api.interceptors.response.use(
    (response) => response,
    async (error) => {
        const originalRequest = error.config;

        // If error is 401 and we haven't retried yet
        if (error.response?.status === 401 && !originalRequest._retry) {
            originalRequest._retry = true;

            try {
                const refreshToken = typeof window !== 'undefined' ? localStorage.getItem('refresh_token') : null;

                if (!refreshToken) {
                    throw new Error('No refresh token available');
                }

                // Call the refresh token endpoint
                // Note: We use axios directly to avoid using the interceptor for this call
                const response = await axios.post(`${api.defaults.baseURL}/api/auth/refresh-token`, {
                    refresh_token: refreshToken,
                });

                const { access_token, refresh_token: new_refresh_token } = response.data;

                // Update local storage
                if (typeof window !== 'undefined') {
                    localStorage.setItem('access_token', access_token);
                    // Optionally update refresh token if the backend rotates it
                    if (new_refresh_token) {
                        localStorage.setItem('refresh_token', new_refresh_token);
                    }
                }

                // Update the header and retry the original request
                originalRequest.headers.Authorization = `Bearer ${access_token}`;
                return api(originalRequest);

            } catch (refreshError) {
                // If refresh fails, clear auth and redirect to login
                clearAuthData();
                if (typeof window !== 'undefined' && window.location.pathname !== '/login') {
                    window.location.href = '/login';
                }
                return Promise.reject(refreshError);
            }
        }

        return Promise.reject(error);
    }
);

export default api;
