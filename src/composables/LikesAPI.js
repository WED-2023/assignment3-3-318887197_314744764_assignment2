import { ref } from 'vue';
import axios from 'axios';
import store from '@/store';

export function LikesAPI() {
  const isLoading = ref(false);
  const error = ref('');

  const getLiked = async () => {
    isLoading.value = true;
    error.value = '';
    
    try {
      const response = await axios.get(
        store.server_domain + "/users/likes", // Changed from /users/liked to /users/likes
        { withCredentials: true }
      );
      console.log('LikesAPI: getLiked response:', response.data);
      return response.data;
    } catch (err) {
      error.value = 'Failed to fetch liked recipes';
      console.error('LikesAPI: getLiked error:', err);
      throw err;
    } finally {
      isLoading.value = false;
    }
  };

  const addToLiked = async (recipeId) => {
    isLoading.value = true;
    error.value = '';
    
    try {
      console.log('LikesAPI: addToLiked called with recipeId:', recipeId);
      
      const cleanRecipeId = String(recipeId).trim();
      console.log('LikesAPI: cleaned recipeId:', cleanRecipeId);
      
      const response = await axios.post(
        store.server_domain + "/users/likes", // Changed from /users/liked to /users/likes
        { recipeId: cleanRecipeId },
        { withCredentials: true }
      );
      console.log('LikesAPI: addToLiked response:', response.data);
      return true;
    } catch (err) {
      error.value = 'Failed to add to liked';
      console.error('LikesAPI: addToLiked error:', err);
      throw err;
    } finally {
      isLoading.value = false;
    }
  };

  const removeFromLiked = async (recipeId) => {
    isLoading.value = true;
    error.value = '';
    
    try {
      console.log('LikesAPI: removeFromLiked called with recipeId:', recipeId);
      
      const cleanRecipeId = String(recipeId).trim();
      console.log('LikesAPI: cleaned recipeId:', cleanRecipeId);
      
      const response = await axios.delete(
        store.server_domain + "/users/likes", // Changed from /users/liked to /users/likes
        {
          data: { recipeId: cleanRecipeId },
          withCredentials: true
        }
      );
      console.log('LikesAPI: removeFromLiked response:', response.data);
      return true;
    } catch (err) {
      error.value = 'Failed to remove from liked';
      console.error('LikesAPI: removeFromLiked error:', err);
      throw err;
    } finally {
      isLoading.value = false;
    }
  };

  const toggleLiked = async (recipeId, currentIsLiked) => {
    console.log('LikesAPI: toggleLiked called with:', { recipeId, currentIsLiked });
    
    if (!recipeId) {
      console.error('LikesAPI: toggleLiked - recipeId is null or undefined');
      throw new Error('Recipe ID is required');
    }
    
    if (currentIsLiked) {
      return await removeFromLiked(recipeId);
    } else {
      return await addToLiked(recipeId);
    }
  };

  return {
    isLoading,
    error,
    getLiked,
    addToLiked,
    removeFromLiked,
    toggleLiked
  };
}