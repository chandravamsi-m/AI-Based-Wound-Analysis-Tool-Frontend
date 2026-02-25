/**
 * API Client with Axios
 * Automatically attaches JWT tokens and handles token refresh
 */

import axios from 'axios';
import authService from './authService';

let VITE_API_URL = import.meta.env.VITE_API_URL || 'http://127.0.0.1:8000';
if (VITE_API_URL.endsWith('/')) {
  VITE_API_URL = VITE_API_URL.slice(0, -1);
}
if (!VITE_API_URL.endsWith('/api')) {
  VITE_API_URL += '/api';
}
const API_BASE_URL = VITE_API_URL;

// Create axios instance
const apiClient = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor - attach token to requests
apiClient.interceptors.request.use(
  (config) => {
    const token = authService.getAccessToken();
    
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptor - handle token refresh on 401
apiClient.interceptors.response.use(
  (response) => {
    return response;
  },
  async (error) => {
    const originalRequest = error.config;

    // If error is 401 and we haven't tried to refresh yet
    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;

      try {
        // Try to refresh the token
        const newToken = await authService.refreshToken();
        
        // Update the failed request with new token
        originalRequest.headers.Authorization = `Bearer ${newToken}`;
        
        // Retry the original request
        return apiClient(originalRequest);
      } catch (refreshError) {
        // Refresh failed, logout user
        authService.clearAuthData();
        
        // Redirect to login
        window.location.href = '/';
        
        return Promise.reject(refreshError);
      }
    }

    // If error is 403, user doesn't have permission
    if (error.response?.status === 403) {
      console.error('Access denied:', error.response.data);
    }

    return Promise.reject(error);
  }
);

export default apiClient;
