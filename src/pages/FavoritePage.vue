<template>
  <!-- Display favorite recipes using the reusable RecipePage component -->
  <RecipePage
    title="My Favorite Recipes"
    description="All the recipes you've saved as favorites."
    :recipes="recipes"
    :watchedRecipeIds="watchedRecipeIds"
    :likedRecipeIds="likedRecipeIds"
    :favoriteRecipeIds="favoriteRecipeIds"
    :isLoading="isLoading"
    :error="error"
    emptyMessage="You haven't saved any favorite recipes yet. Start exploring and save the ones you love!"
    :onRetry="fetchFavoriteRecipes"
    @favoriteToggled="handleFavoriteToggled"
    @likeToggled="handleLikeToggled"
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

// Router instance for navigation
const router = useRouter();

// Use composables
const { getRecipeInfo } = RecipeAPI();                      // Get detailed recipe information
const { getFavorites } = FavoritesAPI();                    // Get user's favorite recipe IDs
const { watchedRecipeIds, likedRecipeIds, favoriteRecipeIds, fetchUserData } = UserData();  // User interaction data

// Reactive data
const recipes = ref([]);        // Array to store favorite recipes with full details
const isLoading = ref(false);   // Loading state for API operations
const error = ref('');          // Error message storage

// Check auth
if (!store.username) {
  router.push({ name: 'login' });
}

// Event handlers
const handleFavoriteToggled = (event) => {
  const { recipeId, newState } = event;
  console.log('FavoritePage: Favorite toggled', { recipeId, newState });
  
  // If recipe was unfavorited, remove it from the list
  if (newState) {
    // Add to favorites if not already there
    if (!favoriteRecipeIds.value.includes(String(recipeId))) {
      favoriteRecipeIds.value.push(String(recipeId));
    }
  } else {
    // Remove from favorites and from the displayed list
    favoriteRecipeIds.value = favoriteRecipeIds.value.filter(id => String(id) !== String(recipeId));
    // Recipe remains visible in the list until page refresh
  }
};

const handleLikeToggled = (event) => {
  const { recipeId, newState } = event;
  console.log('FavoritePage: Like toggled', { recipeId, newState });
  
  // Update likedRecipeIds array immediately
  if (newState) {
    // Add to likes if not already there
    if (!likedRecipeIds.value.includes(String(recipeId))) {
      likedRecipeIds.value.push(String(recipeId));
    }
  } else {
    // Remove from likes
    likedRecipeIds.value = likedRecipeIds.value.filter(id => String(id) !== String(recipeId));
  }
  
  // Update the recipe's like count in the local list
  const recipe = recipes.value.find(r => String(r.id) === String(recipeId));
  if (recipe && typeof recipe.aggregateLikes === 'number') {
    recipe.aggregateLikes += newState ? 1 : -1;
    if (recipe.aggregateLikes < 0) recipe.aggregateLikes = 0;
  }
};

const fetchFavoriteRecipes = async () => {
  isLoading.value = true;
  error.value = '';

  try {
    // Use composable to get favorite recipe IDs
    const favoriteIds = await getFavorites();

    // Fetch full recipe details
    if (favoriteIds.length > 0) {
      // Create promises for fetching each recipe's details
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
      
      // Wait for all recipe fetches to complete
      const fetchedRecipes = await Promise.all(recipePromises);
      // Filter out failed fetches
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

// Initialize data when component mounts
onMounted(() => {
  fetchFavoriteRecipes();
});
</script>