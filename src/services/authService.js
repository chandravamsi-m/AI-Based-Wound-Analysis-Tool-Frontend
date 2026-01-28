/**
 * Authentication Service
 * Handles JWT token management, login, logout, and token refresh
 */

const API_BASE_URL = 'http://127.0.0.1:8000/api';

class AuthService {
  /**
   * Login user and store JWT tokens
   * @param {string} email - User email
   * @param {string} password - User password
   * @param {boolean} rememberMe - Whether to persist session
   * @returns {Promise<Object>} User data and tokens
   */
  async login(email, password, rememberMe = false) {
    try {
      const response = await fetch(`${API_BASE_URL}/auth/login/`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email, password }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Login failed');
      }

      // Store tokens
      const storage = rememberMe ? localStorage : sessionStorage;
      const otherStorage = rememberMe ? sessionStorage : localStorage;

      storage.setItem('access_token', data.access);
      storage.setItem('refresh_token', data.refresh);
      storage.setItem('user', JSON.stringify(data.user));
      storage.setItem('isAuthenticated', 'true');

      // Clear other storage
      otherStorage.removeItem('access_token');
      otherStorage.removeItem('refresh_token');
      otherStorage.removeItem('user');
      otherStorage.removeItem('isAuthenticated');

      // Store remember me preference
      if (rememberMe) {
        localStorage.setItem('rememberedEmail', email);
      } else {
        localStorage.removeItem('rememberedEmail');
      }

      return data.user;
    } catch (error) {
      console.error('Login error:', error);
      throw error;
    }
  }

  /**
   * Logout user and clear tokens
   */
  async logout() {
    try {
      const refreshToken = this.getRefreshToken();
      
      if (refreshToken) {
        // Call logout endpoint to blacklist token
        await fetch(`${API_BASE_URL}/auth/logout/`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${this.getAccessToken()}`,
          },
          body: JSON.stringify({ refresh_token: refreshToken }),
        });
      }
    } catch (error) {
      console.error('Logout error:', error);
    } finally {
      // Clear all auth data regardless of API call success
      this.clearAuthData();
    }
  }

  /**
   * Clear all authentication data from storage
   */
  clearAuthData() {
    // Clear from both storages
    ['localStorage', 'sessionStorage'].forEach(storageName => {
      const storage = window[storageName];
      storage.removeItem('access_token');
      storage.removeItem('refresh_token');
      storage.removeItem('user');
      storage.removeItem('isAuthenticated');
    });
  }

  /**
   * Refresh access token using refresh token
   * @returns {Promise<string>} New access token
   */
  async refreshToken() {
    try {
      const refreshToken = this.getRefreshToken();
      
      if (!refreshToken) {
        throw new Error('No refresh token available');
      }

      const response = await fetch(`${API_BASE_URL}/auth/token/refresh/`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ refresh: refreshToken }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error('Token refresh failed');
      }

      // Update access token
      const storage = this.getStorage();
      storage.setItem('access_token', data.access);
      
      // Update refresh token if rotated
      if (data.refresh) {
        storage.setItem('refresh_token', data.refresh);
      }

      return data.access;
    } catch (error) {
      console.error('Token refresh error:', error);
      this.clearAuthData();
      throw error;
    }
  }

  /**
   * Get current access token
   * @returns {string|null} Access token
   */
  getAccessToken() {
    return localStorage.getItem('access_token') || sessionStorage.getItem('access_token');
  }

  /**
   * Get current refresh token
   * @returns {string|null} Refresh token
   */
  getRefreshToken() {
    return localStorage.getItem('refresh_token') || sessionStorage.getItem('refresh_token');
  }

  /**
   * Get current user data
   * @returns {Object|null} User object
   */
  getUser() {
    const userStr = localStorage.getItem('user') || sessionStorage.getItem('user');
    return userStr ? JSON.parse(userStr) : null;
  }

  /**
   * Get user role
   * @returns {string|null} User role (Admin, Doctor, Nurse)
   */
  getUserRole() {
    const user = this.getUser();
    return user ? user.role : null;
  }

  /**
   * Check if user is authenticated
   * @returns {boolean} Authentication status
   */
  isAuthenticated() {
    return !!(this.getAccessToken() && this.getUser());
  }

  /**
   * Check if user has required permission
   * @param {string|string[]} requiredRole - Required role(s)
   * @returns {boolean} Permission status
   */
  hasPermission(requiredRole) {
    const userRole = this.getUserRole();
    
    if (!userRole) return false;

    if (Array.isArray(requiredRole)) {
      return requiredRole.includes(userRole);
    }

    return userRole === requiredRole;
  }

  /**
   * Get the appropriate storage (localStorage or sessionStorage)
   * @returns {Storage} Storage object
   */
  getStorage() {
    return localStorage.getItem('access_token') ? localStorage : sessionStorage;
  }

  /**
   * Change user password
   * @param {string} oldPassword - Current password
   * @param {string} newPassword - New password
   * @param {string} confirmPassword - Confirm new password
   * @returns {Promise<Object>} Response data
   */
  async changePassword(oldPassword, newPassword, confirmPassword) {
    try {
      const response = await fetch(`${API_BASE_URL}/auth/change-password/`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${this.getAccessToken()}`,
        },
        body: JSON.stringify({
          old_password: oldPassword,
          new_password: newPassword,
          confirm_password: confirmPassword,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Password change failed');
      }

      return data;
    } catch (error) {
      console.error('Password change error:', error);
      throw error;
    }
  }
}

// Export singleton instance
export default new AuthService();
