import { ref } from 'vue';
import axios from 'axios';
import store from '@/store';

/**
 * Favorites API Composable
 * Handles all user favorite recipe operations including fetching, adding, removing, and toggling
 * Uses Vue 3 Composition API with reactive state management
 */
export function FavoritesAPI() {
  // Reactive state for loading and error tracking
  const isLoading = ref(false);
  const error = ref('');

  /**
   * Fetch all favorite recipes for the current user
   * @returns {Promise} - Array of favorite recipe objects
   */
  const getFavorites = async () => {
    isLoading.value = true;
    error.value = '';
    
    try {
      // Send GET request to fetch user's favorite recipes
      const response = await axios.get(
        store.server_domain + "/users/favorites",
        { withCredentials: true }
      );
      console.log('FavoritesAPI: getFavorites response:', response.data);
      return response.data;
    } catch (err) {
      // Set user-friendly error message
      error.value = 'Failed to fetch favorites';
      console.error('FavoritesAPI: getFavorites error:', err);
      throw err;
    } finally {
      // Always reset loading state
      isLoading.value = false;
    }
  };

  /**
   * Add a recipe to the user's favorites
   * @param {string|number} recipeId - The ID of the recipe to add
   * @returns {Promise<boolean>} - True if successful
   */
  const addToFavorites = async (recipeId) => {
    isLoading.value = true;
    error.value = '';
    
    try {
      console.log('FavoritesAPI: addToFavorites called with recipeId:', recipeId);
      
      // Keep recipe ID as string since some IDs may start with 'S' (e.g., Spoonacular IDs)
      const cleanRecipeId = String(recipeId).trim();
      console.log('FavoritesAPI: cleaned recipeId:', cleanRecipeId);
      
      // Send POST request to add recipe to favorites
      const response = await axios.post(
        store.server_domain + "/users/favorites",
        { recipeId: cleanRecipeId }, // Send as string to handle all ID formats
        { withCredentials: true }
      );
      console.log('FavoritesAPI: addToFavorites response:', response.data);
      return true;
    } catch (err) {
      // Set user-friendly error message
      error.value = 'Failed to add to favorites';
      console.error('FavoritesAPI: addToFavorites error:', err);
      throw err;
    } finally {
      // Always reset loading state
      isLoading.value = false;
    }
  };

  /**
   * Remove a recipe from the user's favorites
   * @param {string|number} recipeId - The ID of the recipe to remove
   * @returns {Promise<boolean>} - True if successful
   */
  const removeFromFavorites = async (recipeId) => {
    isLoading.value = true;
    error.value = '';
    
    try {
      console.log('FavoritesAPI: removeFromFavorites called with recipeId:', recipeId);
      
      // Keep recipe ID as string since some IDs may start with 'S' (e.g., Spoonacular IDs)
      const cleanRecipeId = String(recipeId).trim();
      console.log('FavoritesAPI: cleaned recipeId:', cleanRecipeId);
      
      // Send DELETE request to remove recipe from favorites
      const response = await axios.delete(
        store.server_domain + "/users/favorites",
        {
          data: { recipeId: cleanRecipeId }, // Send as string to handle all ID formats
          withCredentials: true
        }
      );
      console.log('FavoritesAPI: removeFromFavorites response:', response.data);
      return true;
    } catch (err) {
      // Set user-friendly error message
      error.value = 'Failed to remove from favorites';
      console.error('FavoritesAPI: removeFromFavorites error:', err);
      throw err;
    } finally {
      // Always reset loading state
      isLoading.value = false;
    }
  };

  /**
   * Toggle favorite status of a recipe (add if not favorited, remove if favorited)
   * @param {string|number} recipeId - The ID of the recipe to toggle
   * @param {boolean} currentIsFavorite - Current favorite status (true if currently favorited)
   * @returns {Promise<boolean>} - True if successful
   */
  const toggleFavorite = async (recipeId, currentIsFavorite) => {
    console.log('FavoritesAPI: toggleFavorite called with:', { recipeId, currentIsFavorite });
    
    // Validate that recipe ID is provided
    if (!recipeId) {
      console.error('FavoritesAPI: toggleFavorite - recipeId is null or undefined');
      throw new Error('Recipe ID is required');
    }
    
    // Call appropriate function based on current favorite status
    if (currentIsFavorite) {
      // Recipe is currently favorited, so remove it
      return await removeFromFavorites(recipeId);
    } else {
      // Recipe is not favorited, so add it
      return await addToFavorites(recipeId);
    }
  };

  // Return all functions and reactive state for use in components
  return {
    isLoading,           // Reactive loading state
    error,               // Reactive error state
    getFavorites,        // Fetch user's favorite recipes
    addToFavorites,      // Add recipe to favorites
    removeFromFavorites, // Remove recipe from favorites
    toggleFavorite       // Toggle favorite status of a recipe
  };
}