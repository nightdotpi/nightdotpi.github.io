// frontend/src/lib/axiosClient.ts
import axios, { AxiosError, InternalAxiosRequestConfig } from 'axios';

/**
 * Backend must ALWAYS be the Bonto API, never the GitHub Pages frontend.
 * POST to nightdotpi.github.io returns HTTP 405 (static host).
 */
const FALLBACK_API_URL = 'https://night.bonto.run/api';

function resolveApiBaseUrl(): string {
  const raw = String(import.meta.env.VITE_API_URL || '').trim();

  // Missing or relative path like "/api" → would hit GitHub Pages → 405
  if (!raw || raw.startsWith('/') || raw.startsWith('./')) {
    console.warn(
      '[axiosClient] VITE_API_URL is missing or relative. Using fallback:',
      FALLBACK_API_URL
    );
    return FALLBACK_API_URL;
  }

  let url = raw.replace(/\/+$/, '');

  // Accidentally pointed at frontend static host
  if (
    /github\.io/i.test(url) ||
    /pinet\.com/i.test(url) && !/bonto/i.test(url)
  ) {
    // allow pinet only if user explicitly needs it; github.io is never API
    if (/github\.io/i.test(url)) {
      console.warn(
        '[axiosClient] VITE_API_URL points to GitHub Pages. Forcing Bonto API.',
        url,
        '→',
        FALLBACK_API_URL
      );
      return FALLBACK_API_URL;
    }
  }

  // Ensure /api suffix for Bonto backend routes
  if (/bonto\.run$/i.test(url) || /bonto\.run\/$/i.test(url + '/')) {
    if (!/\/api$/i.test(url)) {
      url = url + '/api';
    }
  }

  return url;
}

const API_BASE_URL = resolveApiBaseUrl();

console.log('[axiosClient] API_BASE_URL =', API_BASE_URL);

const axiosClient = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
  // Bonto cold start may take a while
  timeout: 30000,
});

axiosClient.interceptors.request.use(
  (config: InternalAxiosRequestConfig) => {
    const token = localStorage.getItem('token');

    if (token && config.headers) {
      config.headers.Authorization = `Bearer ${token}`;
    }

    // Safety: never allow relative baseURL at request time
    if (!config.baseURL || config.baseURL.startsWith('/')) {
      config.baseURL = FALLBACK_API_URL;
    }

    return config;
  },
  (error) => Promise.reject(error)
);

axiosClient.interceptors.response.use(
  (response) => response,
  (error: AxiosError<any>) => {
    if (error.response) {
      const status = error.response.status;
      const url = error.config?.baseURL
        ? `${error.config.baseURL}${error.config.url || ''}`
        : error.config?.url;

      if (status === 401) {
        console.warn('Unauthorized! Cleaning up session...');
        localStorage.removeItem('token');
        localStorage.removeItem('user');

        const currentHash = window.location.hash || '#/';
        if (!currentHash.includes('/login')) {
          window.location.hash = '#/login';
        }
      } else if (status === 405) {
        console.error(
          'HTTP 405: API URL is probably wrong (request hit a static host).',
          'Expected backend:',
          FALLBACK_API_URL,
          'Actual request:',
          url
        );
      } else if (status === 426) {
        console.error(
          'HTTP 426: Open the app inside Pi Browser.',
          error.response.data
        );
      } else if (status === 403) {
        console.error('Forbidden:', error.response.data);
      } else if (status === 404) {
        console.error('API route not found:', url);
      } else if (status === 500) {
        console.error('Server Error:', error.response.data);
      } else {
        console.error('API Error:', {
          status,
          data: error.response.data,
          url,
        });
      }
    } else if (error.request) {
      console.error(
        'Network Error: Cannot reach backend. Check VITE_API_URL / CORS / Bonto status.'
      );
    } else {
      console.error('Axios Error:', error.message);
    }

    return Promise.reject(error);
  }
);

export default axiosClient;
export { API_BASE_URL, FALLBACK_API_URL };
