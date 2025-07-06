import { ref } from 'vue';
import axios from 'axios';
import store from '@/store';

/**
 * My Recipes API Composable
 * Handles all user-created recipe operations including fetching personal recipes, family recipes, and creating new recipes
 * Uses Vue 3 Composition API with reactive state management
 */
export function MyRecipesAPI() {
  // Reactive state for loading and error tracking
  const isLoading = ref(false);
  const error = ref('');

  /**
   * Fetch all personal recipes created by the current user
   * @returns {Promise} - Array of personal recipe objects
   */
  const getMyRecipes = async () => {
    isLoading.value = true;
    error.value = '';
    
    try {
      // Send GET request to fetch user's personal recipes
      const response = await axios.get(
        store.server_domain + "/users/myRecipes",
        { withCredentials: true }
      );
      return response.data;
    } catch (err) {
      // Set user-friendly error message
      error.value = 'Failed to fetch my recipes';
      throw err;
    } finally {
      // Always reset loading state
      isLoading.value = false;
    }
  };

  /**
   * Fetch all family recipes created by the current user
   * @returns {Promise} - Array of family recipe objects
   */
  const getMyFamilyRecipes = async () => {
    isLoading.value = true;
    error.value = '';
    
    try {
      // Send GET request to fetch user's family recipes
      const response = await axios.get(
        store.server_domain + "/users/myFamilyRecipes",
        { withCredentials: true }
      );
      return response.data;
    } catch (err) {
      // Set user-friendly error message
      error.value = 'Failed to fetch my family recipes';
      throw err;
    } finally {
      // Always reset loading state
      isLoading.value = false;
    }
  };

  /**
   * Create a new recipe (either personal or family recipe)
   * @param {Object} recipeData - Complete recipe data including title, ingredients, instructions, etc.
   * @returns {Promise<string>} - The ID of the newly created recipe
   */
  const addMyRecipe = async (recipeData) => {
    isLoading.value = true;
    error.value = '';
    
    try {
      // Send POST request to create a new recipe
      // Backend determines if it's a family or personal recipe based on isFamilyRecipe flag
      const response = await axios.post(
        store.server_domain + "/users/myRecipes",
        { recipe: recipeData }, // Wrap recipe data in object as expected by backend
        { withCredentials: true }
      );
      
      // Return the ID of the newly created recipe for further operations
      return response.data.recipeId;
    } catch (err) {
      // Set user-friendly error message
      error.value = 'Failed to create recipe';
      throw err;
    } finally {
      // Always reset loading state
      isLoading.value = false;
    }
  };

  // Return all functions and reactive state for use in components
  return {
    isLoading,          // Reactive loading state
    error,              // Reactive error state
    getMyRecipes,       // Fetch user's personal recipes
    getMyFamilyRecipes, // Fetch user's family recipes
    addMyRecipe         // Create a new recipe
  };
}