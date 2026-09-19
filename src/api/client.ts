import axios, { AxiosError, InternalAxiosRequestConfig } from 'axios';
import { APP_CONFIG } from '../config';

const BASE_URL = APP_CONFIG.apiBaseUrl;

export const apiClient = axios.create({
  baseURL: BASE_URL,
  timeout: APP_CONFIG.apiTimeout,
  headers: {
    'Content-Type': 'application/json',
    Accept: 'application/json',
  },
});


// Request Interceptor: Attach Auth Token and Language
apiClient.interceptors.request.use(
  (config: InternalAxiosRequestConfig) => {
    const token = localStorage.getItem('dhabayih_access_token');
    if (token && config.headers) {
      config.headers.Authorization = `Bearer ${token}`;
    }

    const currentLang = localStorage.getItem('dhabayih_language') || 'ar';
    if (config.headers) {
      config.headers['Accept-Language'] = currentLang === 'ar' ? 'ar-SA,ar;q=0.9,en;q=0.8' : 'en-US,en;q=0.9,ar;q=0.8';
    }

    // Attach lang parameter to GET requests automatically
    if (config.method?.toLowerCase() === 'get') {
      config.params = {
        lang: currentLang,
        ...(config.params || {}),
      };
    }

    return config;
  },
  (error) => Promise.reject(error)
);


// Response Interceptor: Handle Token Refresh on 401
let isRefreshing = false;
let failedQueue: Array<{
  resolve: (value?: unknown) => void;
  reject: (reason?: unknown) => void;
}> = [];

const processQueue = (error: AxiosError | null, token: string | null = null) => {
  failedQueue.forEach((prom) => {
    if (error) {
      prom.reject(error);
    } else {
      prom.resolve(token);
    }
  });
  failedQueue = [];
};

apiClient.interceptors.response.use(
  (response) => response,
  async (error: AxiosError) => {
    const originalRequest = error.config as InternalAxiosRequestConfig & { _retry?: boolean };

    if (error.response?.status === 401 && !originalRequest._retry) {
      const refreshToken = localStorage.getItem('dhabayih_refresh_token');

      if (!refreshToken) {
        localStorage.removeItem('dhabayih_access_token');
        localStorage.removeItem('dhabayih_refresh_token');
        localStorage.removeItem('dhabayih_user');
        return Promise.reject(error);
      }

      if (isRefreshing) {
        return new Promise((resolve, reject) => {
          failedQueue.push({ resolve, reject });
        })
          .then((token) => {
            if (originalRequest.headers) {
              originalRequest.headers.Authorization = `Bearer ${token}`;
            }
            return apiClient(originalRequest);
          })
          .catch((err) => Promise.reject(err));
      }

      originalRequest._retry = true;
      isRefreshing = true;

      try {
        const refreshResponse = await axios.post(
          `${BASE_URL}/api/v1/auth/refresh`,
          {},
          {
            headers: {
              Authorization: `Bearer ${refreshToken}`,
            },
          }
        );

        const data = refreshResponse.data?.data || refreshResponse.data;
        const newAccessToken = data.access_token;
        const newRefreshToken = data.refresh_token;

        if (newAccessToken) {
          localStorage.setItem('dhabayih_access_token', newAccessToken);
          if (newRefreshToken) {
            localStorage.setItem('dhabayih_refresh_token', newRefreshToken);
          }

          apiClient.defaults.headers.common['Authorization'] = `Bearer ${newAccessToken}`;
          if (originalRequest.headers) {
            originalRequest.headers.Authorization = `Bearer ${newAccessToken}`;
          }

          processQueue(null, newAccessToken);
          return apiClient(originalRequest);
        }
      } catch (refreshErr) {
        processQueue(refreshErr as AxiosError, null);
        localStorage.removeItem('dhabayih_access_token');
        localStorage.removeItem('dhabayih_refresh_token');
        localStorage.removeItem('dhabayih_user');
        return Promise.reject(refreshErr);
      } finally {
        isRefreshing = false;
      }
    }

    return Promise.reject(error);
  }
);