import axios from 'axios';

/**
 * Centralized Axios Instance for Hyper-Local Community Ordering Backend
 */
const getBaseURL = () => {
  // Support both Create React App (process.env) and Vite (import.meta.env)
  if (typeof process !== 'undefined' && process.env && process.env.REACT_APP_API_URL) {
    return process.env.REACT_APP_API_URL;
  }
  if (typeof import.meta !== 'undefined' && import.meta.env && import.meta.env.VITE_API_URL) {
    return import.meta.env.VITE_API_URL;
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

/**
 * Request Interceptor: Attach Bearer JWT token if available in localStorage
 */
axiosClient.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

/**
 * Response Interceptor: Centralized Error Handling & Auto-Logout on 401
 */
axiosClient.interceptors.response.use(
  (response) => {
    return response;
  },
  (error) => {
    if (error.response) {
      // Auto-logout on 401 Unauthorized / Expired Token
      if (error.response.status === 401) {
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        
        // Dispatch custom auth error event so AuthContext can handle state update
        if (typeof window !== 'undefined') {
          window.dispatchEvent(new Event('auth:unauthorized'));
        }
      }

      // Extract server error message
      const message =
        error.response.data && error.response.data.message
          ? error.response.data.message
          : `Request failed with status ${error.response.status}`;

      return Promise.reject(new Error(message));
    } else if (error.request) {
      // Network failure / Server unreachable
      return Promise.reject(new Error('Network error. Unable to connect to backend server.'));
    } else {
      return Promise.reject(error);
    }
  }
);

export default axiosClient;
