import axios from 'axios';

/** Sự kiện phát ra khi một request (không phải đăng nhập) nhận 401: phiên đã hết hạn. */
export const UNAUTHORIZED_EVENT = 'nexus:unauthorized';

// baseURL rỗng = cùng origin (Vite proxy /api sang backend). Có thể đặt VITE_API_BASE_URL để gọi thẳng backend.
export const apiClient = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL ?? '',
  timeout: 10_000,
  withCredentials: true,
  withXSRFToken: true,
  xsrfCookieName: 'XSRF-TOKEN',
  xsrfHeaderName: 'X-XSRF-TOKEN',
  headers: { Accept: 'application/json' },
});

const SESSION_PROBE_URLS = ['/api/v1/auth/me', '/api/v1/auth/login'];

apiClient.interceptors.response.use(
  (response) => response,
  (error: unknown) => {
    if (axios.isAxiosError(error) && error.response?.status === 401) {
      const url = error.config?.url ?? '';
      if (!SESSION_PROBE_URLS.some((probe) => url.endsWith(probe))) {
        window.dispatchEvent(new Event(UNAUTHORIZED_EVENT));
      }
    }
    return Promise.reject(error);
  },
);
