import { ref } from 'vue';
import axios from 'axios';
import store from '@/store';

/**
 * Authentication API Composable
 * Handles all user authentication operations including register, login, logout, and session management
 * Uses Vue 3 Composition API with reactive state management
 */
export function AuthAPI() {
  // Reactive state for loading and error tracking
  const isLoading = ref(false);
  const error = ref('');

  /**
   * Register a new user account
   * @param {Object} userData - User registration data (username, email, password, etc.)
   * @returns {Promise} - API response data
   */
  const register = async (userData) => {
    isLoading.value = true;
    error.value = '';
    
    try {
      // Send registration request to backend
      const response = await axios.post(
        store.server_domain + "/Register",
        userData
      );
      return response.data;
    } catch (err) {
      // Set user-friendly error message
      error.value = 'Failed to register';
      throw err;
    } finally {
      // Always reset loading state
      isLoading.value = false;
    }
  };

  /**
   * Login user with credentials
   * @param {Object} credentials - Login credentials (username, password)
   * @returns {Promise} - API response data
   */
  const login = async (credentials) => {
    isLoading.value = true;
    error.value = '';
    
    try {
      // Send login request with credentials included for session management
      const response = await axios.post(
        store.server_domain + "/Login",
        credentials,
        { withCredentials: true }
      );
      
      // Update global store state on successful login
      store.username = credentials.username;
      
      // Clear any cached data since user context has changed
      if (store.clearMainPageCache) {
        store.clearMainPageCache();
      }
      
      return response.data;
    } catch (err) {
      // Set user-friendly error message
      error.value = 'Failed to login';
      throw err;
    } finally {
      // Always reset loading state
      isLoading.value = false;
    }
  };

  /**
   * Logout current user and clear session
   * @returns {Promise} - API response data
   */
  const logout = async () => {
    isLoading.value = true;
    error.value = '';
    
    try {
      // Send logout request to backend to clear server session
      const response = await axios.post(
        store.server_domain + "/Logout",
        {},
        { withCredentials: true }
      );
      
      // Clear all user-related data from global store
      store.username = null;
      store.lastViewedRecipes = [];
      
      // Clear any cached data since user is now logged out
      if (store.clearMainPageCache) {
        store.clearMainPageCache();
      }
      
      return response.data;
    } catch (err) {
      // Set user-friendly error message
      error.value = 'Failed to logout';
      throw err;
    } finally {
      // Always reset loading state
      isLoading.value = false;
    }
  };

  /**
   * Check if user is still authenticated (session validation)
   * Used for app initialization and route guards
   * @returns {Promise<boolean>} - True if authenticated, false otherwise
   */
  const checkAuth = async () => {
    try {
      // Request user info from backend to validate session
      const response = await axios.get(store.server_domain + "/me", {
        withCredentials: true
      });
      
      // Update store with current user info if session is valid
      store.username = response.data.username;
      return true;
    } catch (error) {
      // Clear store data if session is invalid or expired
      store.username = null;
      return false;
    }
  };

  /**
   * Check if the backend server is responding
   * Used for health checks and connection validation
   * @returns {Promise<boolean>} - True if server is alive, false otherwise
   */
  const checkAlive = async () => {
    try {
      // Simple health check endpoint
      const response = await axios.get(store.server_domain + "/alive");
      return response.data;
    } catch (err) {
      console.error('Server not responding');
      return false;
    }
  };

  // Return all functions and reactive state for use in components
  return {
    isLoading,     // Reactive loading state
    error,         // Reactive error state
    register,      // User registration function
    login,         // User login function
    logout,        // User logout function
    checkAuth,     // Session validation function
    checkAlive     // Server health check function
  };
}