import { ref } from 'vue';
import axios from 'axios';
import store from '@/store';

export function WatchedAPI() {
  const isLoading = ref(false);
  const error = ref('');

  const getWatched = async () => {
    isLoading.value = true;
    error.value = '';
    
    try {
      const response = await axios.get(
        store.server_domain + "/users/watched",
        { withCredentials: true }
      );
      console.log('WatchedAPI: getWatched response:', response.data);
      return response.data; // Array of recipe IDs
    } catch (err) {
      error.value = 'Failed to fetch watched recipes';
      console.error('WatchedAPI: getWatched error:', err);
      throw err;
    } finally {
      isLoading.value = false;
    }
  };

  // Since there's no "recent" endpoint, we'll get all and take the last 3
  const getRecentWatched = async (count = 3) => {
    try {
      const allWatched = await getWatched();
      // Return the last 'count' items (most recently added)
      // Note: This assumes the API returns them in chronological order
      // If not, you might need to reverse the array first
      return allWatched.slice(-count).reverse();
    } catch (err) {
      console.error('WatchedAPI: getRecentWatched error:', err);
      throw err;
    }
  };

  const addToWatched = async (recipeId) => {
    isLoading.value = true;
    error.value = '';
    
    try {
      console.log('WatchedAPI: addToWatched called with recipeId:', recipeId);
      
      const cleanRecipeId = String(recipeId).trim();
      console.log('WatchedAPI: cleaned recipeId:', cleanRecipeId);
      
      const response = await axios.post(
        store.server_domain + "/users/watched",
        { recipeId: cleanRecipeId },
        { withCredentials: true }
      );
      console.log('WatchedAPI: addToWatched response:', response.data);
      return true;
    } catch (err) {
      error.value = 'Failed to add to watched';
      console.error('WatchedAPI: addToWatched error:', err);
      throw err;
    } finally {
      isLoading.value = false;
    }
  };

  const removeFromWatched = async (recipeId) => {
    isLoading.value = true;
    error.value = '';
    
    try {
      console.log('WatchedAPI: removeFromWatched called with recipeId:', recipeId);
      
      const cleanRecipeId = String(recipeId).trim();
      
      const response = await axios.delete(
        store.server_domain + "/users/watched",
        {
          data: { recipeId: cleanRecipeId },
          withCredentials: true
        }
      );
      console.log('WatchedAPI: removeFromWatched response:', response.data);
      return true;
    } catch (err) {
      error.value = 'Failed to remove from watched';
      console.error('WatchedAPI: removeFromWatched error:', err);
      throw err;
    } finally {
      isLoading.value = false;
    }
  };

  return {
    isLoading,
    error,
    getWatched,
    getRecentWatched, // This now works by getting all and slicing
    addToWatched,
    removeFromWatched
  };
}