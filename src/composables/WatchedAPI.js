import { ref } from 'vue';
import axios from 'axios';
import store from '@/store';

/**
 * Watched API Composable
 * Handles all user watched recipe operations including fetching, adding, and removing watched recipes
 * Tracks user's recipe viewing history for personalized recommendations
 * Uses Vue 3 Composition API with reactive state management
 */
export function WatchedAPI() {
  // Reactive state for loading and error tracking
  const isLoading = ref(false);
  const error = ref('');

  /**
   * Fetch all recipes that the user has watched/viewed
   * @returns {Promise<Array>} - Array of recipe IDs that have been watched
   */
  const getWatched = async () => {
    isLoading.value = true;
    error.value = '';
    
    try {
      // Send GET request to fetch user's watched recipe history
      const response = await axios.get(
        store.server_domain + "/users/watched",
        { withCredentials: true }
      );
      console.log('WatchedAPI: getWatched response:', response.data);
      return response.data; // Array of recipe IDs
    } catch (err) {
      // Set user-friendly error message
      error.value = 'Failed to fetch watched recipes';
      console.error('WatchedAPI: getWatched error:', err);
      throw err;
    } finally {
      // Always reset loading state
      isLoading.value = false;
    }
  };

  /**
   * Get the most recently watched recipes (limited count)
   * Since there's no dedicated "recent" endpoint, we fetch all and take the first items
   * @param {number} count - Number of recent recipes to return (default: 3)
   * @returns {Promise<Array>} - Array of most recently watched recipe IDs
   */
  const getRecentWatched = async (count = 3) => {
    try {
      // Get all watched recipes first
      const allWatched = await getWatched();
      
      // Return the first 'count' items (most recently added)
      // Note: This assumes the API returns them in reverse chronological order (newest first)
      // If the API returns oldest first, you might need to reverse the array
      return allWatched.slice(0, count);
    } catch (err) {
      console.error('WatchedAPI: getRecentWatched error:', err);
      throw err;
    }
  };

  /**
   * Add a recipe to the user's watched list
   * Called when user views a recipe to track viewing history
   * @param {string|number} recipeId - The ID of the recipe to mark as watched
   * @returns {Promise<boolean>} - True if successful
   */
  const addToWatched = async (recipeId) => {
    isLoading.value = true;
    error.value = '';
    
    try {
      console.log('WatchedAPI: addToWatched called with recipeId:', recipeId);
      
      // Keep recipe ID as string since some IDs may start with 'S' (e.g., Spoonacular IDs)
      const cleanRecipeId = String(recipeId).trim();
      console.log('WatchedAPI: cleaned recipeId:', cleanRecipeId);
      
      // Send POST request to add recipe to watched list
      const response = await axios.post(
        store.server_domain + "/users/watched",
        { recipeId: cleanRecipeId }, // Send as string to handle all ID formats
        { withCredentials: true }
      );
      console.log('WatchedAPI: addToWatched response:', response.data);
      return true;
    } catch (err) {
      // Set user-friendly error message
      error.value = 'Failed to add to watched';
      console.error('WatchedAPI: addToWatched error:', err);
      throw err;
    } finally {
      // Always reset loading state
      isLoading.value = false;
    }
  };

  /**
   * Remove a recipe from the user's watched list
   * Used for cleaning up viewing history if needed
   * @param {string|number} recipeId - The ID of the recipe to remove from watched
   * @returns {Promise<boolean>} - True if successful
   */
  const removeFromWatched = async (recipeId) => {
    isLoading.value = true;
    error.value = '';
    
    try {
      console.log('WatchedAPI: removeFromWatched called with recipeId:', recipeId);
      
      // Keep recipe ID as string since some IDs may start with 'S' (e.g., Spoonacular IDs)
      const cleanRecipeId = String(recipeId).trim();
      
      // Send DELETE request to remove recipe from watched list
      const response = await axios.delete(
        store.server_domain + "/users/watched",
        {
          data: { recipeId: cleanRecipeId }, // Send as string to handle all ID formats
          withCredentials: true
        }
      );
      console.log('WatchedAPI: removeFromWatched response:', response.data);
      return true;
    } catch (err) {
      // Set user-friendly error message
      error.value = 'Failed to remove from watched';
      console.error('WatchedAPI: removeFromWatched error:', err);
      throw err;
    } finally {
      // Always reset loading state
      isLoading.value = false;
    }
  };

  // Return all functions and reactive state for use in components
  return {
    isLoading,           // Reactive loading state
    error,               // Reactive error state
    getWatched,          // Fetch all watched recipes
    getRecentWatched,    // Get recent watched recipes (limited count)
    addToWatched,        // Add recipe to watched list
    removeFromWatched    // Remove recipe from watched list
  };
}