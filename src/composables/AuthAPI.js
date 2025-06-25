import { ref } from 'vue';
import axios from 'axios';
import store from '@/store';

export function AuthAPI() {
  const isLoading = ref(false);
  const error = ref('');

  const register = async (userData) => {
    isLoading.value = true;
    error.value = '';
    
    try {
      const response = await axios.post(
        store.server_domain + "/Register",
        userData
      );
      return response.data;
    } catch (err) {
      error.value = 'Failed to register';
      throw err;
    } finally {
      isLoading.value = false;
    }
  };

  const login = async (credentials) => {
    isLoading.value = true;
    error.value = '';
    
    try {
      const response = await axios.post(
        store.server_domain + "/Login",
        credentials,
        { withCredentials: true }
      );
      
      // Update store state on successful login
      store.username = credentials.username;
      
      // Clear cache on login since user data changes
      if (store.clearMainPageCache) {
        store.clearMainPageCache();
      }
      
      return response.data;
    } catch (err) {
      error.value = 'Failed to login';
      throw err;
    } finally {
      isLoading.value = false;
    }
  };

  const logout = async () => {
    isLoading.value = true;
    error.value = '';
    
    try {
      const response = await axios.post(
        store.server_domain + "/Logout",
        {},
        { withCredentials: true }
      );
      
      // Update store state on successful logout
      store.username = null;
      store.lastViewedRecipes = [];
      
      // Clear cache on logout
      if (store.clearMainPageCache) {
        store.clearMainPageCache();
      }
      
      return response.data;
    } catch (err) {
      error.value = 'Failed to logout';
      throw err;
    } finally {
      isLoading.value = false;
    }
  };

  const checkAuth = async () => {
    try {
      const response = await axios.get(store.server_domain + "/me", {
        withCredentials: true
      });
      
      // Update store state on successful auth check
      store.username = response.data.username;
      return true;
    } catch (error) {
      // Clear store state if auth check fails
      store.username = null;
      return false;
    }
  };

  const checkAlive = async () => {
    try {
      const response = await axios.get(store.server_domain + "/alive");
      return response.data;
    } catch (err) {
      console.error('Server not responding');
      return false;
    }
  };

  return {
    isLoading,
    error,
    register,
    login,
    logout,
    checkAuth,
    checkAlive
  };
}