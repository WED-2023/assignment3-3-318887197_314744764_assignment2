import { ref } from 'vue';
import axios from 'axios';
import store from '@/store';

export function FavoritesAPI() {
  const isLoading = ref(false);
  const error = ref('');

  const getFavorites = async () => {
    isLoading.value = true;
    error.value = '';
    
    try {
      const response = await axios.get(
        store.server_domain + "/users/favorites",
        { withCredentials: true }
      );
      console.log('FavoritesAPI: getFavorites response:', response.data);
      return response.data;
    } catch (err) {
      error.value = 'Failed to fetch favorites';
      console.error('FavoritesAPI: getFavorites error:', err);
      throw err;
    } finally {
      isLoading.value = false;
    }
  };

  const addToFavorites = async (recipeId) => {
    isLoading.value = true;
    error.value = '';
    
    try {
      console.log('FavoritesAPI: addToFavorites called with recipeId:', recipeId);
      
      // Don't parse as integer - keep as string since IDs can start with 'S'
      const cleanRecipeId = String(recipeId).trim();
      console.log('FavoritesAPI: cleaned recipeId:', cleanRecipeId);
      
      const response = await axios.post(
        store.server_domain + "/users/favorites",
        { recipeId: cleanRecipeId }, // Send as string, not parsed integer
        { withCredentials: true }
      );
      console.log('FavoritesAPI: addToFavorites response:', response.data);
      return true;
    } catch (err) {
      error.value = 'Failed to add to favorites';
      console.error('FavoritesAPI: addToFavorites error:', err);
      throw err;
    } finally {
      isLoading.value = false;
    }
  };

  const removeFromFavorites = async (recipeId) => {
    isLoading.value = true;
    error.value = '';
    
    try {
      console.log('FavoritesAPI: removeFromFavorites called with recipeId:', recipeId);
      
      // Don't parse as integer - keep as string since IDs can start with 'S'
      const cleanRecipeId = String(recipeId).trim();
      console.log('FavoritesAPI: cleaned recipeId:', cleanRecipeId);
      
      const response = await axios.delete(
        store.server_domain + "/users/favorites",
        {
          data: { recipeId: cleanRecipeId }, // Send as string, not parsed integer
          withCredentials: true
        }
      );
      console.log('FavoritesAPI: removeFromFavorites response:', response.data);
      return true;
    } catch (err) {
      error.value = 'Failed to remove from favorites';
      console.error('FavoritesAPI: removeFromFavorites error:', err);
      throw err;
    } finally {
      isLoading.value = false;
    }
  };

  const toggleFavorite = async (recipeId, currentIsFavorite) => {
    console.log('FavoritesAPI: toggleFavorite called with:', { recipeId, currentIsFavorite });
    
    if (!recipeId) {
      console.error('FavoritesAPI: toggleFavorite - recipeId is null or undefined');
      throw new Error('Recipe ID is required');
    }
    
    if (currentIsFavorite) {
      return await removeFromFavorites(recipeId);
    } else {
      return await addToFavorites(recipeId);
    }
  };

  return {
    isLoading,
    error,
    getFavorites,
    addToFavorites,
    removeFromFavorites,
    toggleFavorite
  };
}