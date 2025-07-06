import { ref } from 'vue';
import axios from 'axios';
import store from '@/store';

/**
 * Recipe API Composable
 * Handles all recipe-related operations including fetching recipe details, random recipes, and searching
 * Communicates with Spoonacular API through backend proxy
 * Uses Vue 3 Composition API with reactive state management
 */
export function RecipeAPI() {
  // Reactive state for loading and error tracking
  const isLoading = ref(false);
  const error = ref('');

  /**
   * Fetch detailed information for a specific recipe
   * @param {string|number} recipeId - The ID of the recipe to fetch
   * @returns {Promise} - Detailed recipe object with ingredients, instructions, etc.
   */
  const getRecipeInfo = async (recipeId) => {
    isLoading.value = true;
    error.value = '';
    
    try {
      // Send GET request to fetch detailed recipe information
      const response = await axios.get(
        store.server_domain + "/recipes/info",
        { params: { recipeId } }
      );
      return response.data;
    } catch (err) {
      // Set user-friendly error message
      error.value = 'Failed to fetch recipe information';
      throw err;
    } finally {
      // Always reset loading state
      isLoading.value = false;
    }
  };

  /**
   * Fetch a specified number of random recipes
   * @param {number} number - Number of random recipes to fetch (default: 3)
   * @returns {Promise} - Array of random recipe objects
   */
  const getRandomRecipes = async (number = 3) => {
    isLoading.value = true;
    error.value = '';
    
    try {
      // Send GET request to fetch random recipes from Spoonacular API
      const response = await axios.get(
        store.server_domain + "/recipes/random",
        { params: { number } }
      );
      return response.data;
    } catch (err) {
      console.error('RecipeAPI: getRandomRecipes error:', err);
      
      // Handle specific API quota error (402 Payment Required)
      if (err.response && err.response.status === 402) {
        error.value = 'Spoonacular API quota exceeded. Please check your API key or try again later.';
      } else {
        error.value = 'Failed to fetch random recipes';
      }
      
      // Re-throw error so MainPage can catch and handle 402 specifically
      // This allows the page to show fallback content when API quota is exceeded
      throw err;
    } finally {
      // Always reset loading state
      isLoading.value = false;
    }
  };

  /**
   * Search for recipes based on various criteria
   * @param {Object} searchParams - Search parameters including query, diet, cuisine, etc.
   * @returns {Promise} - Array of recipe objects matching search criteria
   */
  const searchRecipes = async (searchParams) => {
    isLoading.value = true;
    error.value = '';
    
    try {
      // Send POST request with search parameters to find matching recipes
      const response = await axios.post(
        store.server_domain + "/recipes/Search",
        searchParams
      );
      return response.data;
    } catch (err) {
      // Set user-friendly error message
      error.value = 'Failed to search recipes';
      throw err;
    } finally {
      // Always reset loading state
      isLoading.value = false;
    }
  };

  // Return all functions and reactive state for use in components
  return {
    isLoading,        // Reactive loading state
    error,            // Reactive error state
    getRecipeInfo,    // Fetch detailed recipe information
    getRandomRecipes, // Fetch random recipes
    searchRecipes     // Search recipes by criteria
  };
}