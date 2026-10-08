import axios from 'axios';

/**
 * Centralized Axios Instance for Hyper-Local Community Ordering Backend (Vite)
 */
const getBaseURL = () => {
  // Vite (preferred): VITE_API_URL is baked in at build time
  if (typeof import.meta !== 'undefined' && import.meta.env && import.meta.env.VITE_API_URL) {
    return import.meta.env.VITE_API_URL;
  }
  // CRA-style fallback
  if (typeof process !== 'undefined' && process.env && process.env.REACT_APP_API_URL) {
    return process.env.REACT_APP_API_URL;
  }

  // Production safety net: never ship a build that points at localhost.
  // If the env var was missing at build time we still aim at the deployed API
  // so the live site works instead of failing every request.
  if (import.meta?.env?.PROD) {
    return 'https://ashva-backend.onrender.com';
  }

  return 'http://localhost:5000';
};

const axiosClient = axios.create({
  baseURL: getBaseURL(),
  headers: {
    'Content-Type': 'application/json',
  },
  timeout: 15000,
});

axiosClient.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

axiosClient.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response) {
      if (error.response.status === 401) {
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        if (typeof window !== 'undefined') {
          window.dispatchEvent(new Event('auth:unauthorized'));
        }
      }
      const message =
        error.response.data && error.response.data.message
          ? error.response.data.message
          : `Request failed with status ${error.response.status}`;

      // Preserve any machine-readable code (e.g. PASSWORD_LOCKED, ROLE_MISMATCH)
      // so the UI can distinguish these from an ordinary failure.
      const wrapped = new Error(message);
      if (error.response.data && error.response.data.code) {
        wrapped.code = error.response.data.code;
      }
      return Promise.reject(wrapped);
    } else if (error.request) {
      return Promise.reject(new Error('Network error. Unable to connect to backend server.'));
    } else {
      return Promise.reject(error);
    }
  }
);

export default axiosClient;
