<template>
  <RecipePage
    title="My Personal Recipes"
    description="All your personal recipes that you've created."
    :recipes="recipes"
    :watchedRecipeIds="watchedRecipeIds"
    :likedRecipeIds="likedRecipeIds"
    :isLoading="isLoading"
    :error="error"
    emptyMessage="You haven't created any personal recipes yet. Start creating to build your collection!"
    :onRetry="fetchPersonalRecipes"
  >
    <template #empty-action>
      <button class="cta-button disabled" disabled>
        Create Recipe
      </button>
    </template>
  </RecipePage>
</template>

<script setup>
import { ref, onMounted } from 'vue';
import { useRouter } from 'vue-router';
import RecipePage from '@/components/RecipePage.vue';
import store from '@/store';
import { RecipeAPI } from '@/composables/RecipeAPI';
import { MyRecipesAPI } from '@/composables/MyRecipesAPI';
import { UserData } from '@/composables/UserData';

const router = useRouter();

// Use composables
const { getRecipeInfo } = RecipeAPI();
const { getMyRecipes } = MyRecipesAPI();
const { watchedRecipeIds, likedRecipeIds, fetchUserData } = UserData();

// Reactive data
const recipes = ref([]);
const isLoading = ref(false);
const error = ref('');

// Check auth
if (!store.username) {
  router.push({ name: 'login' });
}

const fetchPersonalRecipes = async () => {
  isLoading.value = true;
  error.value = '';

  try {
    // Use composable to get personal recipe IDs
    const personalRecipeIds = await getMyRecipes();

    // Fetch full recipe details
    if (personalRecipeIds.length > 0) {
      const recipePromises = personalRecipeIds.map(async (recipeId) => {
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
    console.error('Error fetching personal recipes:', err);
    if (err.response?.status === 401) {
      error.value = 'You need to be logged in to view your personal recipes.';
      router.push({ name: 'login' });
    } else {
      error.value = 'Failed to load your personal recipes. Please try again.';
    }
  } finally {
    isLoading.value = false;
  }
};

onMounted(() => {
  fetchPersonalRecipes();
});
</script>

<style scoped>
.cta-button {
  display: inline-block;
  background: #14b8a6;
  color: white;
  padding: 0.75rem 1.5rem;
  border-radius: 0.5rem;
  text-decoration: none;
  font-weight: 500;
  transition: background-color 0.2s;
  border: none;
  cursor: pointer;
}

.cta-button:hover {
  background: #0f766e;
}

.cta-button.disabled,
.cta-button:disabled {
  background: #9ca3af !important;
  color: #6b7280 !important;
  cursor: not-allowed !important;
  opacity: 0.6;
}

.cta-button.disabled:hover,
.cta-button:disabled:hover {
  background: #9ca3af !important;
}
</style>