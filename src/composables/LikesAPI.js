import { ref } from 'vue';
import axios from 'axios';
import store from '@/store';

/**
 * Likes API Composable
 * Handles all user liked recipe operations including fetching, adding, removing, and toggling
 * Uses Vue 3 Composition API with reactive state management
 */
export function LikesAPI() {
  // Reactive state for loading and error tracking
  const isLoading = ref(false);
  const error = ref('');

  /**
   * Fetch all liked recipes for the current user
   * @returns {Promise} - Array of liked recipe objects
   */
  const getLiked = async () => {
    isLoading.value = true;
    error.value = '';
    
    try {
      // Send GET request to fetch user's liked recipes
      const response = await axios.get(
        store.server_domain + "/users/likes", // Updated endpoint for likes
        { withCredentials: true }
      );
      console.log('LikesAPI: getLiked response:', response.data);
      return response.data;
    } catch (err) {
      // Set user-friendly error message
      error.value = 'Failed to fetch liked recipes';
      console.error('LikesAPI: getLiked error:', err);
      throw err;
    } finally {
      // Always reset loading state
      isLoading.value = false;
    }
  };

  /**
   * Add a recipe to the user's liked list
   * @param {string|number} recipeId - The ID of the recipe to like
   * @returns {Promise<boolean>} - True if successful
   */
  const addToLiked = async (recipeId) => {
    isLoading.value = true;
    error.value = '';
    
    try {
      console.log('LikesAPI: addToLiked called with recipeId:', recipeId);
      
      // Keep recipe ID as string since some IDs may start with 'S' (e.g., Spoonacular IDs)
      const cleanRecipeId = String(recipeId).trim();
      console.log('LikesAPI: cleaned recipeId:', cleanRecipeId);
      
      // Send POST request to add recipe to liked list
      const response = await axios.post(
        store.server_domain + "/users/likes", // Updated endpoint for likes
        { recipeId: cleanRecipeId }, // Send as string to handle all ID formats
        { withCredentials: true }
      );
      console.log('LikesAPI: addToLiked response:', response.data);
      return true;
    } catch (err) {
      // Set user-friendly error message
      error.value = 'Failed to add to liked';
      console.error('LikesAPI: addToLiked error:', err);
      throw err;
    } finally {
      // Always reset loading state
      isLoading.value = false;
    }
  };

  /**
   * Remove a recipe from the user's liked list
   * @param {string|number} recipeId - The ID of the recipe to unlike
   * @returns {Promise<boolean>} - True if successful
   */
  const removeFromLiked = async (recipeId) => {
    isLoading.value = true;
    error.value = '';
    
    try {
      console.log('LikesAPI: removeFromLiked called with recipeId:', recipeId);
      
      // Keep recipe ID as string since some IDs may start with 'S' (e.g., Spoonacular IDs)
      const cleanRecipeId = String(recipeId).trim();
      console.log('LikesAPI: cleaned recipeId:', cleanRecipeId);
      
      // Send DELETE request to remove recipe from liked list
      const response = await axios.delete(
        store.server_domain + "/users/likes", // Updated endpoint for likes
        {
          data: { recipeId: cleanRecipeId }, // Send as string to handle all ID formats
          withCredentials: true
        }
      );
      console.log('LikesAPI: removeFromLiked response:', response.data);
      return true;
    } catch (err) {
      // Set user-friendly error message
      error.value = 'Failed to remove from liked';
      console.error('LikesAPI: removeFromLiked error:', err);
      throw err;
    } finally {
      // Always reset loading state
      isLoading.value = false;
    }
  };

  /**
   * Toggle like status of a recipe (add if not liked, remove if liked)
   * @param {string|number} recipeId - The ID of the recipe to toggle
   * @param {boolean} currentIsLiked - Current like status (true if currently liked)
   * @returns {Promise<boolean>} - True if successful
   */
  const toggleLiked = async (recipeId, currentIsLiked) => {
    console.log('LikesAPI: toggleLiked called with:', { recipeId, currentIsLiked });
    
    // Validate that recipe ID is provided
    if (!recipeId) {
      console.error('LikesAPI: toggleLiked - recipeId is null or undefined');
      throw new Error('Recipe ID is required');
    }
    
    // Call appropriate function based on current like status
    if (currentIsLiked) {
      // Recipe is currently liked, so remove it from liked list
      return await removeFromLiked(recipeId);
    } else {
      // Recipe is not liked, so add it to liked list
      return await addToLiked(recipeId);
    }
  };

  // Return all functions and reactive state for use in components
  return {
    isLoading,        // Reactive loading state
    error,            // Reactive error state
    getLiked,         // Fetch user's liked recipes
    addToLiked,       // Add recipe to liked list
    removeFromLiked,  // Remove recipe from liked list
    toggleLiked       // Toggle like status of a recipe
  };
}