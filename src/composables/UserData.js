import { ref } from 'vue';
import { WatchedAPI } from '@/composables/WatchedAPI';
import { FavoritesAPI } from '@/composables/FavoritesAPI';
import { LikesAPI } from '@/composables/LikesAPI';
import store from '@/store';

/**
 * User Data Composable
 * Centralizes fetching and managing all user-related data including watched, favorite, and liked recipes
 * Provides helper functions to check recipe status and handles authentication state
 * Uses Vue 3 Composition API with reactive state management
 */
export function UserData() {
  // Reactive arrays to store user's recipe IDs
  const watchedRecipeIds = ref([]);    // Recipes the user has viewed
  const favoriteRecipeIds = ref([]);   // Recipes the user has marked as favorites
  const likedRecipeIds = ref([]);      // Recipes the user has liked
  
  // Reactive state for loading and error tracking
  const isLoading = ref(false);
  const error = ref('');

  // Import API functions from other composables
  const { getWatched } = WatchedAPI();
  const { getFavorites } = FavoritesAPI();
  const { getLiked } = LikesAPI();

  /**
   * Fetch all user data including watched, favorites, and liked recipes
   * Uses Promise.allSettled to handle partial failures gracefully
   */
  const fetchUserData = async () => {
    // Early return if user is not authenticated
    if (!store.username) {
      watchedRecipeIds.value = [];
      favoriteRecipeIds.value = [];
      likedRecipeIds.value = [];
      return;
    }

    isLoading.value = true;
    error.value = '';

    try {
      // Fetch all user data in parallel for better performance
      // Promise.allSettled ensures one failure doesn't stop the others
      const [watched, favorites, liked] = await Promise.allSettled([
        getWatched(),
        getFavorites(),
        getLiked()
      ]);

      // Handle watched recipes result
      if (watched.status === 'fulfilled') {
        // Convert all IDs to strings for consistent comparison
        watchedRecipeIds.value = watched.value.map(id => String(id));
      } else {
        console.warn('Failed to fetch watched recipes:', watched.reason);
        watchedRecipeIds.value = [];
      }

      // Handle favorite recipes result
      if (favorites.status === 'fulfilled') {
        // Convert all IDs to strings for consistent comparison
        favoriteRecipeIds.value = favorites.value.map(id => String(id));
      } else {
        console.warn('Failed to fetch favorite recipes:', favorites.reason);
        favoriteRecipeIds.value = [];
      }

      // Handle liked recipes result
      if (liked.status === 'fulfilled') {
        // Convert all IDs to strings for consistent comparison
        likedRecipeIds.value = liked.value.map(id => String(id));
      } else {
        console.warn('Failed to fetch liked recipes:', liked.reason);
        likedRecipeIds.value = [];
      }

      console.log('UserData: Fetched user data:', {
        watched: watchedRecipeIds.value,
        favorites: favoriteRecipeIds.value,
        liked: likedRecipeIds.value
      });

    } catch (err) {
      // Set user-friendly error message
      error.value = 'Failed to fetch user data';
      console.error('UserData: fetchUserData error:', err);
    } finally {
      // Always reset loading state
      isLoading.value = false;
    }
  };

  /**
   * Fetch only user preferences (favorites and likes) without watched recipes
   * Used when we only need interaction data, not viewing history
   */
  const fetchUserPreferencesOnly = async () => {
    // Early return if user is not authenticated
    if (!store.username) {
      favoriteRecipeIds.value = [];
      likedRecipeIds.value = [];
      return;
    }

    isLoading.value = true;
    error.value = '';

    try {
      // Only fetch favorites and likes - NO watched recipes
      // This is useful for performance when viewing history isn't needed
      const [favorites, liked] = await Promise.allSettled([
        getFavorites(),
        getLiked()
      ]);

      // Handle favorite recipes result
      if (favorites.status === 'fulfilled') {
        // Convert all IDs to strings for consistent comparison
        favoriteRecipeIds.value = favorites.value.map(id => String(id));
      } else {
        console.warn('Failed to fetch favorite recipes:', favorites.reason);
        favoriteRecipeIds.value = [];
      }

      // Handle liked recipes result
      if (liked.status === 'fulfilled') {
        // Convert all IDs to strings for consistent comparison
        likedRecipeIds.value = liked.value.map(id => String(id));
      } else {
        console.warn('Failed to fetch liked recipes:', liked.reason);
        likedRecipeIds.value = [];
      }

      console.log('UserData: Fetched user preferences only:', {
        favorites: favoriteRecipeIds.value,
        liked: likedRecipeIds.value
      });

    } catch (err) {
      // Set user-friendly error message
      error.value = 'Failed to fetch user preferences';
      console.error('UserData: fetchUserPreferencesOnly error:', err);
    } finally {
      // Always reset loading state
      isLoading.value = false;
    }
  };

  // Helper functions to check recipe status - convert IDs to strings for consistent comparison

  /**
   * Check if a recipe has been watched by the user
   * @param {string|number} recipeId - The recipe ID to check
   * @returns {boolean} - True if recipe has been watched
   */
  const isWatched = (recipeId) => watchedRecipeIds.value.includes(String(recipeId));

  /**
   * Check if a recipe is in the user's favorites
   * @param {string|number} recipeId - The recipe ID to check
   * @returns {boolean} - True if recipe is favorited
   */
  const isFavorite = (recipeId) => favoriteRecipeIds.value.includes(String(recipeId));

  /**
   * Check if a recipe has been liked by the user
   * @param {string|number} recipeId - The recipe ID to check
   * @returns {boolean} - True if recipe is liked
   */
  const isLiked = (recipeId) => likedRecipeIds.value.includes(String(recipeId));

  // Return all state and methods for use in components
  return {
    // Reactive state arrays
    watchedRecipeIds,        // Array of watched recipe IDs
    favoriteRecipeIds,       // Array of favorite recipe IDs
    likedRecipeIds,          // Array of liked recipe IDs
    isLoading,               // Loading state for API calls
    error,                   // Error message if something goes wrong
    
    // Methods for fetching data
    fetchUserData,           // Fetch all user data (watched, favorites, likes)
    fetchUserPreferencesOnly, // Fetch only preferences (favorites, likes)
    
    // Helper methods for checking recipe status
    isWatched,               // Check if recipe is watched
    isFavorite,              // Check if recipe is favorited
    isLiked                  // Check if recipe is liked
  };
}