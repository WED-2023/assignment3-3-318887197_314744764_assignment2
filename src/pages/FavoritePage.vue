<template>
  <RecipePage
    title="My Favorite Recipes"
    description="All the recipes you've saved as favorites."
    :recipes="recipes"
    :watchedRecipeIds="watchedRecipeIds"
    :likedRecipeIds="likedRecipeIds"
    :isLoading="isLoading"
    :error="error"
    emptyMessage="You haven't saved any favorite recipes yet. Start exploring and save the ones you love!"
    :onRetry="fetchFavoriteRecipes"
  />
</template>

<script setup>
import { ref, onMounted } from 'vue';
import { useRouter } from 'vue-router';
import RecipePage from '@/components/RecipePage.vue';
import store from '@/store';
import { RecipeAPI } from '@/composables/RecipeAPI';
import { FavoritesAPI } from '@/composables/FavoritesAPI';
import { UserData } from '@/composables/UserData';

const router = useRouter();

// Use composables
const { getRecipeInfo } = RecipeAPI();
const { getFavorites } = FavoritesAPI();
const { watchedRecipeIds, likedRecipeIds, fetchUserData } = UserData();

// Reactive data
const recipes = ref([]);
const isLoading = ref(false);
const error = ref('');

// Check auth
if (!store.username) {
  router.push({ name: 'login' });
}

const fetchFavoriteRecipes = async () => {
  isLoading.value = true;
  error.value = '';

  try {
    // Use composable to get favorite recipe IDs
    const favoriteIds = await getFavorites();

    // Fetch full recipe details
    if (favoriteIds.length > 0) {
      const recipePromises = favoriteIds.map(async (recipeId) => {
        try {
          const recipeData = await getRecipeInfo(recipeId);
          return {
            id: recipeId,
            ...recipeData
          };
        } catch (error) {
          console.error(`Error fetching recipe ${recipeId}:`, error);
          return null;
        }
      });
      
      const fetchedRecipes = await Promise.all(recipePromises);
      recipes.value = fetchedRecipes.filter(recipe => recipe !== null);
    } else {
      recipes.value = [];
    }

    // Use composable to fetch user data (watched/liked recipes)
    await fetchUserData();

  } catch (err) {
    console.error('Error fetching favorite recipes:', err);
    if (err.response?.status === 401) {
      error.value = 'You need to be logged in to view your favorites.';
      router.push({ name: 'login' });
    } else {
      error.value = 'Failed to load your favorite recipes. Please try again.';
    }
  } finally {
    isLoading.value = false;
  }
};

onMounted(() => {
  fetchFavoriteRecipes();
});
</script>