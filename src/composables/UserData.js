import { ref } from 'vue';
import { WatchedAPI } from '@/composables/WatchedAPI';
import { FavoritesAPI } from '@/composables/FavoritesAPI';
import { LikesAPI } from '@/composables/LikesAPI';
import store from '@/store';

export function UserData() {
  const watchedRecipeIds = ref([]);
  const favoriteRecipeIds = ref([]);
  const likedRecipeIds = ref([]);
  const isLoading = ref(false);
  const error = ref('');

  const { getWatched } = WatchedAPI();
  const { getFavorites } = FavoritesAPI();
  const { getLiked } = LikesAPI();

  const fetchUserData = async () => {
    if (!store.username) {
      watchedRecipeIds.value = [];
      favoriteRecipeIds.value = [];
      likedRecipeIds.value = [];
      return;
    }

    isLoading.value = true;
    error.value = '';

    try {
      // Fetch all user data in parallel
      const [watched, favorites, liked] = await Promise.allSettled([
        getWatched(),
        getFavorites(),
        getLiked()
      ]);

      // Handle watched recipes
      if (watched.status === 'fulfilled') {
        watchedRecipeIds.value = watched.value.map(id => String(id));
      } else {
        console.warn('Failed to fetch watched recipes:', watched.reason);
        watchedRecipeIds.value = [];
      }

      // Handle favorite recipes
      if (favorites.status === 'fulfilled') {
        favoriteRecipeIds.value = favorites.value.map(id => String(id));
      } else {
        console.warn('Failed to fetch favorite recipes:', favorites.reason);
        favoriteRecipeIds.value = [];
      }

      // Handle liked recipes
      if (liked.status === 'fulfilled') {
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
      error.value = 'Failed to fetch user data';
      console.error('UserData: fetchUserData error:', err);
    } finally {
      isLoading.value = false;
    }
  };

    const fetchUserPreferencesOnly = async () => {
    if (!store.username) {
      favoriteRecipeIds.value = [];
      likedRecipeIds.value = [];
      return;
    }

    isLoading.value = true;
    error.value = '';

    try {
      // Only fetch favorites and likes - NO watched recipes
      const [favorites, liked] = await Promise.allSettled([
        getFavorites(),
        getLiked()
      ]);

      // Handle favorite recipes
      if (favorites.status === 'fulfilled') {
        favoriteRecipeIds.value = favorites.value.map(id => String(id));
      } else {
        console.warn('Failed to fetch favorite recipes:', favorites.reason);
        favoriteRecipeIds.value = [];
      }

      // Handle liked recipes
      if (liked.status === 'fulfilled') {
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
      error.value = 'Failed to fetch user preferences';
      console.error('UserData: fetchUserPreferencesOnly error:', err);
    } finally {
      isLoading.value = false;
    }
  };

  // Helper functions to check recipe status
  const isWatched = (recipeId) => watchedRecipeIds.value.includes(String(recipeId));
  const isFavorite = (recipeId) => favoriteRecipeIds.value.includes(String(recipeId));
  const isLiked = (recipeId) => likedRecipeIds.value.includes(String(recipeId));

  return {
    // State
    watchedRecipeIds,
    favoriteRecipeIds,
    likedRecipeIds,
    isLoading,
    error,
    
    // Methods
    fetchUserData,
    fetchUserPreferencesOnly,
    isWatched,
    isFavorite,
    isLiked
  };
}