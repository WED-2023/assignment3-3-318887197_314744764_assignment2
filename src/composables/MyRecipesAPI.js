import { ref } from 'vue';
import axios from 'axios';
import store from '@/store';

export function MyRecipesAPI() {
  const isLoading = ref(false);
  const error = ref('');

  const getMyRecipes = async () => {
    isLoading.value = true;
    error.value = '';
    
    try {
      const response = await axios.get(
        store.server_domain + "/users/myRecipes",
        { withCredentials: true }
      );
      return response.data;
    } catch (err) {
      error.value = 'Failed to fetch my recipes';
      throw err;
    } finally {
      isLoading.value = false;
    }
  };

  const getMyFamilyRecipes = async () => {
    isLoading.value = true;
    error.value = '';
    
    try {
      const response = await axios.get(
        store.server_domain + "/users/myFamilyRecipes",
        { withCredentials: true }
      );
      return response.data;
    } catch (err) {
      error.value = 'Failed to fetch my family recipes';
      throw err;
    } finally {
      isLoading.value = false;
    }
  };

  const addMyRecipe = async (recipeData) => {
    isLoading.value = true;
    error.value = '';
    
    try {
      const response = await axios.post(
        store.server_domain + "/users/myRecipes",
        { recipe: recipeData },
        { withCredentials: true }
      );
      return response.data.recipeId;
    } catch (err) {
      error.value = 'Failed to create recipe';
      throw err;
    } finally {
      isLoading.value = false;
    }
  };

  return {
    isLoading,
    error,
    getMyRecipes,
    getMyFamilyRecipes,
    addMyRecipe
  };
}