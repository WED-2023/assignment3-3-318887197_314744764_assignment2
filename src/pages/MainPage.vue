<template>
  <div class="container">
    <h1 class="mt-5 mb-4">Welcome to Recipe World</h1>
    
    <!-- Random Recipes Section -->
    <section class="mb-5">
      <div class="d-flex justify-content-between align-items-center mb-3">
        <h2>Random Recipes</h2>
        <button @click="refreshData" class="btn btn-outline-primary btn-sm" :disabled="isRefreshing">
          <i class="fas fa-sync-alt" :class="{ 'fa-spin': isRefreshing }"></i>
          {{ isRefreshing ? 'Refreshing...' : 'Refresh' }}
        </button>
      </div>
      
      <div v-if="randomLoading" class="text-center">
        <div class="spinner-border" role="status">
          <span class="visually-hidden">Loading...</span>
        </div>
      </div>
      <div v-else-if="mainPageRandomError" class="alert alert-danger">
        {{ mainPageRandomError }}
        <button @click="fetchRandomRecipes(true)" class="btn btn-sm btn-outline-danger ms-2">Retry</button>
      </div>
        <div v-else class="row">
          <div v-for="recipe in randomRecipes" :key="recipe.id" class="col-md-4 mb-4">
            <RecipePreview 
              :recipe="recipe" 
              :watchedRecipeIds="localWatchedRecipeIds"
              :favoriteRecipeIds="favoriteRecipeIds"
              :likedRecipeIds="likedRecipeIds"
              @favoriteToggled="handleFavoriteToggled"
              @likeToggled="handleLikeToggled"
            />
          </div>
        </div>
    </section>

    <!-- Second Section: Last Viewed (logged in) OR Blurred Random (not logged in) -->
    <section class="mb-5">
      <!-- Logged in users: Show last viewed recipes -->
      <div v-if="store.username">
        <h2 class="mb-3">Your Recently Viewed</h2>
        <div v-if="lastViewedLoading" class="text-center">
          <div class="spinner-border" role="status">
            <span class="visually-hidden">Loading...</span>
          </div>
        </div>
        <div v-else-if="lastViewedError" class="alert alert-warning">
          {{ lastViewedError }}
        </div>
        <div v-else-if="lastViewedRecipes.length === 0" class="alert alert-info">
          You haven't viewed any recipes yet. Start exploring!
        </div>
          <div v-else class="row">
            <div v-for="recipe in lastViewedRecipes" :key="recipe.id" class="col-md-4 mb-4">
              <RecipePreview 
                :recipe="recipe" 
                :watchedRecipeIds="localWatchedRecipeIds"
                :favoriteRecipeIds="favoriteRecipeIds"
                :likedRecipeIds="likedRecipeIds"
                @favoriteToggled="handleFavoriteToggled"
                @likeToggled="handleLikeToggled"
              />
            </div>
          </div>
      </div>

      <!-- Not logged in: Show blurred random recipes with login prompt -->
      <div v-else>
        <div class="position-relative">
          <h2 class="mb-3">Your Recently Viewed</h2>
          <div v-if="blurredRandomLoading" class="text-center">
            <div class="spinner-border" role="status">
              <span class="visually-hidden">Loading...</span>
            </div>
          </div>
          <div v-else class="row">
            <div v-for="recipe in blurredRandomRecipes" :key="`blurred-${recipe.id}`" class="col-md-4 mb-4">
              <div class="blurred-recipe-container">
                <RecipePreview 
                  :recipe="recipe" 
                  :isBlurred="true" 
                  :isClickable="false"
                  :watchedRecipeIds="[]"
                />
              </div>
            </div>
          </div>
          
          <!-- Login overlay -->
          <div class="login-overlay">
            <div class="login-prompt">
              <h4 class="mb-3">See Your Recently Viewed Recipes</h4>
              <p class="mb-3">Login to track and view your recipe history</p>
              <router-link :to="{ name: 'login' }" class="btn btn-primary btn-lg">
                Login Now
              </router-link>
            </div>
          </div>
        </div>
      </div>
    </section>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue';
import store from '@/store';
import { RecipeAPI } from '@/composables/RecipeAPI';
import { WatchedAPI } from '@/composables/WatchedAPI';
import { UserData } from '@/composables/UserData';
import RecipePreview from '@/components/RecipePreview.vue';

// Use composables (don't destructure the error from RecipeAPI)
const { getRandomRecipes, getRecipeInfo, isLoading: randomLoading } = RecipeAPI();
const { getRecentWatched, isLoading: lastViewedLoading, error: lastViewedError } = WatchedAPI();
const { favoriteRecipeIds, likedRecipeIds, watchedRecipeIds: userWatchedIds, fetchUserData, fetchUserPreferencesOnly } = UserData();
// Reactive data
const randomRecipes = ref([]);
const lastViewedRecipes = ref([]);
const blurredRandomRecipes = ref([]);
const localWatchedRecipeIds = ref([]);
const blurredRandomLoading = ref(false);
const isRefreshing = ref(false);

// Create local error variable controlled only by MainPage
const mainPageRandomError = ref('');

// Helper function to compare recipe lists
const areRecipeListsEqual = (list1, list2) => {
  if (list1.length !== list2.length) {
    console.log('MainPage: Recipe lists different length:', list1.length, 'vs', list2.length);
    return false;
  }
  
  // Compare recipe IDs and order
  for (let i = 0; i < list1.length; i++) {
    if (!list1[i] || !list2[i] || list1[i].id !== list2[i].id) {
      console.log('MainPage: Recipe lists differ at index', i, ':', list1[i]?.id, 'vs', list2[i]?.id);
      return false;
    }
  }
  
  console.log('MainPage: Recipe lists are identical');
  return true;
};

// Event handlers for updating user data
const handleFavoriteToggled = (event) => {
  const { recipeId, newState } = event;
  console.log('MainPage: Favorite toggled', { recipeId, newState });
  
  if (newState) {
    // Add to favorites
    if (!favoriteRecipeIds.value.includes(String(recipeId))) {
      favoriteRecipeIds.value.push(String(recipeId));
    }
  } else {
    // Remove from favorites
    favoriteRecipeIds.value = favoriteRecipeIds.value.filter(id => id !== String(recipeId));
  }
};

const handleLikeToggled = (event) => {
  const { recipeId, newState } = event;
  console.log('MainPage: Like toggled', { recipeId, newState });
  
  if (newState) {
    // Add to likes
    if (!likedRecipeIds.value.includes(String(recipeId))) {
      likedRecipeIds.value.push(String(recipeId));
    }
  } else {
    // Remove from likes
    likedRecipeIds.value = likedRecipeIds.value.filter(id => id !== String(recipeId));
  }

    const updateLikes = (recipes) => {
    const recipe = recipes.find(r => String(r.id) === String(recipeId));
    if (recipe) {
      if (typeof recipe.aggregateLikes === 'number') {
        recipe.aggregateLikes += newState ? 1 : -1;
        // Prevent negative likes
        if (recipe.aggregateLikes < 0) recipe.aggregateLikes = 0;
      }
    }
  };

  // Update in both lists if present
  updateLikes(randomRecipes.value);
  updateLikes(lastViewedRecipes.value);
};

const fetchRandomRecipes = async (forceRefresh = false) => {
  console.log('MainPage: Fetching data', { forceRefresh, username: store.username });

  // Clear MainPage error on new fetch
  mainPageRandomError.value = '';

  if (!forceRefresh && randomRecipes.value.length > 0) {
    console.log('MainPage: Data already loaded from cache, skipping fetch');
    return;
  }

  // Always fetch 3 random recipes for the first section with error handling
  console.log('MainPage: Fetching random recipes...');
  let randomData = [];
  
  try {
    randomData = await getRandomRecipes(3);
    randomRecipes.value = randomData;
    console.log('MainPage: Random recipes result:', randomData);
  } catch (err) {
    console.error('MainPage: Error fetching random recipes:', err);
    
    // Check if it's a 402 error specifically
    if (err.response && err.response.status === 402) {
      // Set MainPage custom error message for 402
      mainPageRandomError.value = 'Spoonacular API key exhausted';
    } else {
      // Set MainPage custom error message for other errors
      mainPageRandomError.value = 'Failed to fetch random recipes';
    }
    
    randomRecipes.value = [];
  }

  let lastViewedData = [];
  let blurredRandomData = [];
  let watchedIds = [];

  if (store.username) {
    console.log('MainPage: User is logged in, fetching watched recipes...');
    // User is logged in: fetch recent watched recipes and all watched IDs
    try {
      // Get all watched recipe IDs for marking viewed recipes
      // Fetch user data FIRST (favorites, likes, watched) - ONLY ONCE HERE
      console.log('MainPage: Fetching user data...');
      await fetchUserData();

      // Use the watched IDs that were already fetched by fetchUserData
      watchedIds = userWatchedIds.value.map(id => String(id));
      localWatchedRecipeIds.value = userWatchedIds.value;
      console.log('MainPage: Using watched IDs from UserData:', watchedIds);

      // Get recent watched recipe IDs (last 3) - only if there are watched recipes
      if (watchedIds.length > 0) {
        console.log('MainPage: Fetching recent watched recipes...');
        const recentWatchedIds = await getRecentWatched(3);
        console.log('MainPage: Recent watched IDs:', recentWatchedIds);
        
        // Fetch full recipe details for each recent watched recipe ID
        if (recentWatchedIds.length > 0) {
          const recipePromises = recentWatchedIds.map(async (recipeId) => {
            try {
              console.log(`MainPage: Fetching recipe details for ${recipeId}`);
              const recipeData = await getRecipeInfo(recipeId);
              return {
                id: recipeId,
                ...recipeData
              };
            } catch (error) {
              console.error(`Error fetching watched recipe ${recipeId}:`, error);
              return null;
            }
          });
          
          const fetchedRecipes = await Promise.all(recipePromises);
          const newLastViewedData = fetchedRecipes.filter(recipe => recipe !== null);
          console.log('MainPage: Fetched last viewed recipes:', newLastViewedData);

          // Only update if the list is different
          if (!areRecipeListsEqual(lastViewedRecipes.value, newLastViewedData)) {
            console.log('MainPage: Last viewed list has changed, updating...');
            lastViewedData = newLastViewedData;
          } else {
            console.log('MainPage: Last viewed list unchanged, keeping current data');
            lastViewedData = lastViewedRecipes.value; // Keep current data
          }
        }
      } else {
        console.log('MainPage: No watched recipes found for user');
        lastViewedData = [];
      }
    } catch (err) {
      console.log('MainPage: Error fetching watched recipes (user might not have any):', err);
      lastViewedData = [];
      watchedIds = [];
    }
  } else {
    console.log('MainPage: User not logged in, fetching blurred random recipes...');
    // User not logged in: fetch 3 more random recipes for blurred section
    blurredRandomLoading.value = true;
    try {
      blurredRandomData = await getRandomRecipes(3);
      console.log('MainPage: Blurred random recipes:', blurredRandomData);
    } catch (err) {
      console.log('Error fetching blurred random recipes');
      // For blurred recipes, also handle 402 error
      if (err.response && err.response.status === 402) {
        console.log('MainPage: 402 error for blurred recipes too');
      }
      blurredRandomData = [];
    } finally {
      blurredRandomLoading.value = false;
    }
  }

  lastViewedRecipes.value = lastViewedData;
  blurredRandomRecipes.value = blurredRandomData;

  // Cache the data if store supports it
  if (store.cacheMainPageData) {
    console.log('MainPage: Caching data...');
    store.cacheMainPageData(randomData, lastViewedData, blurredRandomData, watchedIds);
  }
};

const refreshData = async () => {
  isRefreshing.value = true;
  
  try {
    // Clear cache before refresh
    if (store.clearMainPageCache) {
      store.clearMainPageCache();
    }
    
    await fetchRandomRecipes(true);
  } catch (error) {
    console.error('Error refreshing data:', error);
  } finally {
    isRefreshing.value = false;
  }
};

onMounted(() => {
  console.log('MainPage: onMounted called');
  
  // Check if we have cached data before fetching
  const cachedData = store.getCachedMainPageData ? store.getCachedMainPageData() : null;
  
  // Use sessionStorage to track if this is a real page refresh
  const pageLoadId = sessionStorage.getItem('mainPageLoadId');
  const currentLoadId = Date.now().toString();
  
  // If no pageLoadId exists, this is likely a fresh browser session/reload
  const isFirstLoad = !pageLoadId;
  sessionStorage.setItem('mainPageLoadId', currentLoadId);
  
  // Check if referrer is from the same origin (internal navigation)
  const cameFromApp = document.referrer && 
                      document.referrer.includes(window.location.origin);
  
  console.log('MainPage: Navigation context:', {
    hasCache: !!cachedData,
    isFirstLoad,
    cameFromApp,
    referrer: document.referrer
  });
  
  // Clear cache only on fresh browser session/actual reload
  if (isFirstLoad && !cameFromApp) {
    console.log('MainPage: Fresh browser session detected, clearing cache');
    if (store.clearMainPageCache) {
      store.clearMainPageCache();
    }
  }
  
  // Use cache if available and this is internal navigation
  const shouldUseCache = cachedData && cameFromApp && !isFirstLoad;
  
  if (shouldUseCache) {
    console.log('MainPage: Using cached data on navigation return');
    randomRecipes.value = cachedData.randomRecipes;
    lastViewedRecipes.value = cachedData.lastViewedRecipes || [];
    blurredRandomRecipes.value = cachedData.blurredRandomRecipes || [];
    localWatchedRecipeIds.value = cachedData.watchedRecipeIds || [];
    
    // ONLY fetch user data (likes/favorites) if logged in - no API calls for recipes
    if (store.username) {
      console.log('MainPage: Fetching ONLY user data for cached recipes');
      fetchUserPreferencesOnly(); // This should only update favorites/likes, not refetch recipes
    }
  } else {
    console.log('MainPage: No cache or fresh session, fetching fresh data');
    fetchRandomRecipes();
  }
});

// Expose method to force refresh (for when recipe is watched)
const refreshDataFromExternal = () => {
  refreshData();
};

defineExpose({ refreshData: refreshDataFromExternal });
</script>

<style scoped>
.container {
  max-width: 1200px;
}

h1 {
  color: #2c3e50;
  text-align: center;
}

h2 {
  color: #34495e;
  border-bottom: 2px solid #3498db;
  padding-bottom: 0.5rem;
}

.spinner-border {
  color: #3498db;
}

.btn-outline-primary {
  font-size: 0.875rem;
}

.fa-sync-alt.fa-spin {
  animation: fa-spin 1s infinite linear;
}

/* Blurred recipes section */
.blurred-recipe-container {
  filter: blur(4px);
  pointer-events: none;
  user-select: none;
}

.position-relative {
  position: relative;
}

.login-overlay {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(255, 255, 255, 0.9);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 10;
}

.login-prompt {
  text-align: center;
  background: white;
  padding: 2rem;
  border-radius: 1rem;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.15);
  border: 2px solid #3498db;
}

.login-prompt h4 {
  color: #2c3e50;
  margin-bottom: 1rem;
}

.login-prompt p {
  color: #7f8c8d;
  font-size: 1.1rem;
}

.btn-primary {
  background-color: #3498db;
  border-color: #3498db;
  font-weight: 600;
  padding: 0.75rem 2rem;
  border-radius: 0.5rem;
}

.btn-primary:hover {
  background-color: #2980b9;
  border-color: #2980b9;
  transform: translateY(-2px);
  transition: all 0.3s ease;
}

/* Mobile responsiveness */
@media (max-width: 768px) {
  .login-prompt {
    margin: 1rem;
    padding: 1.5rem;
  }
  
  .login-prompt h4 {
    font-size: 1.3rem;
  }
  
  .login-prompt p {
    font-size: 1rem;
  }
}
</style>