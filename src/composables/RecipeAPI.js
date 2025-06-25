import { ref } from 'vue';
import axios from 'axios';
import store from '@/store';

export function RecipeAPI() {
  const isLoading = ref(false);
  const error = ref('');

  const getRecipeInfo = async (recipeId) => {
    isLoading.value = true;
    error.value = '';
    
    try {
      const response = await axios.get(
        store.server_domain + "/recipes/info",
        { params: { recipeId } }
      );
      return response.data;
    } catch (err) {
      error.value = 'Failed to fetch recipe information';
      throw err;
    } finally {
      isLoading.value = false;
    }
  };

const getRandomRecipes = async (number = 3) => {
  isLoading.value = true;
  error.value = '';
  
  try {
    const response = await axios.get(
      store.server_domain + "/recipes/random",
      { params: { number } }
    );
    return response.data;
  } catch (err) {
    console.error('RecipeAPI: getRandomRecipes error:', err);
    
    // Set error message but still throw so MainPage can catch it
    if (err.response && err.response.status === 402) {
      error.value = 'Spoonacular API quota exceeded. Please check your API key or try again later.';
    } else {
      error.value = 'Failed to fetch random recipes';
    }
    
    // Throw the error so MainPage can catch and handle 402 specifically
    throw err;
  } finally {
    isLoading.value = false;
  }
};

  const searchRecipes = async (searchParams) => {
    isLoading.value = true;
    error.value = '';
    
    try {
      const response = await axios.post(
        store.server_domain + "/recipes/Search",
        searchParams
      );
      return response.data;
    } catch (err) {
      error.value = 'Failed to search recipes';
      throw err;
    } finally {
      isLoading.value = false;
    }
  };

  return {
    isLoading,
    error,
    getRecipeInfo,
    getRandomRecipes,
    searchRecipes
  };
}