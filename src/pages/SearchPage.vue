<template>
  <div class="container mt-4">
    <h1 class="mb-4">Search Recipes</h1>
    
    <!-- Search Form -->
    <div class="card mb-4">
      <div class="card-body">
        <form @submit.prevent="handleSearch">
          <div class="row">
            <div class="col-md-6 mb-3">
              <label for="title" class="form-label">Recipe Title</label>
              <input
                type="text"
                class="form-control"
                id="title"
                v-model="searchForm.title"
                placeholder="Search for a recipe..."
              />
            </div>
            <div class="col-md-6 mb-3">
              <label for="cuisine" class="form-label">Cuisine</label>
                <select class="form-select" id="cuisine" v-model="searchForm.cuisine">
                  <option value="">Any Cuisine</option>
                  <option v-for="cuisine in cuisines" :key="cuisine" :value="cuisine">{{ cuisine }}</option>
                </select>
            </div>
          </div>
          
          <div class="row">
            <div class="col-md-6 mb-3">
              <label for="diet" class="form-label">Diet</label>
                <select class="form-select" id="diet" v-model="searchForm.diet">
                  <option value="">Any Diet</option>
                  <option v-for="diet in diets" :key="diet" :value="diet">{{ diet }}</option>
                </select>
            </div>
            <div class="col-md-6 mb-3">
              <label for="amount" class="form-label">Number of Results</label>
              <select class="form-select" id="amount" v-model="searchForm.amount">
                <option value="5">5 results</option>
                <option value="10">10 results</option>
                <option value="15">15 results</option>
              </select>
            </div>
          </div>
          
          <div class="mb-3">
            <label for="intolerances" class="form-label">Intolerances</label>
            <Multiselect
              id="intolerances"
              v-model="searchForm.intolerances"
              :options="availableIntolerances"
              :multiple="true"
              :close-on-select="false"
              :clear-on-select="false"
              :preserve-search="true"
              placeholder="Select intolerances"
              label=""
              track-by=""
              class="w-100"
            />
          </div>
          
          <button type="submit" class="btn btn-primary" :disabled="searchLoading">
            <span v-if="searchLoading" class="spinner-border spinner-border-sm me-2" role="status"></span>
            {{ searchLoading ? 'Searching...' : 'Search Recipes' }}
          </button>
        </form>
      </div>
    </div>

    <!-- Search Results -->
    <div v-if="searchError" class="alert alert-danger">
      {{ searchError }}
      <button @click="handleSearch" class="btn btn-sm btn-outline-danger ms-2">Retry</button>
    </div>

    <div v-if="searchResults.length > 0">
      <div class="d-flex justify-content-between align-items-center mb-3">
        <h2 class="mb-0">Search Results ({{ sortedResults.length }} found)</h2>
        <div class="d-flex align-items-center gap-2">
          <label for="sortBy" class="form-label mb-0">Sort by:</label>
          <select class="form-select" id="sortBy" v-model="sortBy" style="width: auto;">
            <option value="default">Default</option>
            <option value="title-asc">Alphabetical (A-Z)</option>
            <option value="title-desc">Alphabetical (Z-A)</option>
            <option value="likes-desc">Most Liked</option>
            <option value="likes-asc">Least Liked</option>
            <option value="time-desc">Longest Time</option>
            <option value="time-asc">Shortest Time</option>
          </select>
        </div>
      </div>
      <div class="row">
        <div v-for="recipe in sortedResults" :key="recipe.id" class="col-md-4 mb-4">
          <RecipePreview 
            :recipe="recipe" 
            :watchedRecipeIds="store.watchedRecipeIds"
            :favoriteRecipeIds="store.favoriteRecipeIds"
            :likedRecipeIds="store.likedRecipeIds"
            @likeToggled="handleLikeToggled"
            @favoriteToggled="handleFavoriteToggled"
          />
        </div>
      </div>
    </div>

    <div v-else-if="hasSearched && !searchLoading" class="alert alert-info">
      No recipes found matching your criteria. Try adjusting your search parameters.
    </div>
  </div>
</template>

<script setup>
import Multiselect from 'vue-multiselect'
import 'vue-multiselect/dist/vue-multiselect.min.css'
import { diets } from '@/assets/diets';
import { cuisines } from '@/assets/cuisines';
import { intolerances as availableIntolerances } from '@/assets/intolerances';
import { ref, reactive, onMounted, computed } from 'vue';
import { RecipeAPI } from '@/composables/RecipeAPI';
import { FavoritesAPI } from '@/composables/FavoritesAPI';
import { LikesAPI } from '@/composables/LikesAPI';
import RecipePreview from '@/components/RecipePreview.vue';
import store from '@/store';

// Use composables for API operations
const { searchRecipes, getRecipeInfo, isLoading: searchLoading, error: searchError } = RecipeAPI();
const { getFavorites } = FavoritesAPI();
const { getLiked } = LikesAPI();

// Reactive data for search functionality
const searchResults = ref([]);                    // Array of search results
const hasSearched = ref(false);                   // Track if user has performed a search
const sortBy = ref('default');                    // Current sort option for results

// Search form data with all possible search parameters
const searchForm = reactive({
  title: '',
  cuisine: '',
  diet: '',
  intolerances: [],
  amount: 5
});

// Load user's personal data (favorites and likes) for display
const loadUserData = async () => {
  if (!store.username) {
    console.log('SearchPage: No user logged in, skipping user data load');
    return;
  }

  try {
    console.log('SearchPage: Loading user favorites and likes');
    
    // Fetch user's favorites and likes
    const [favoriteIds, likedIds] = await Promise.all([
      getFavorites(),
      getLiked()
    ]);

    // Update store with user's data
    store.favoriteRecipeIds = favoriteIds.map(id => String(id));
    store.likedRecipeIds = likedIds.map(id => String(id));

    console.log('SearchPage: Loaded favorites:', store.favoriteRecipeIds);
    console.log('SearchPage: Loaded likes:', store.likedRecipeIds);

  } catch (error) {
    console.error('SearchPage: Error loading user data:', error);
  }
};

// Helper function to compare search parameters for caching
const areSearchParamsEqual = (params1, params2) => {
  if (!params1 || !params2) return false;
  
  const keys1 = Object.keys(params1).sort();
  const keys2 = Object.keys(params2).sort();
  
  if (keys1.length !== keys2.length) return false;
  
  for (let key of keys1) {
    if (key === 'intolerances') {
      // Compare arrays
      if (JSON.stringify(params1[key]?.sort()) !== JSON.stringify(params2[key]?.sort())) {
        return false;
      }
    } else {
      if (params1[key] !== params2[key]) return false;
    }
  }
  
  return true;
};

// Computed property for sorted search results
const sortedResults = computed(() => {
  if (!searchResults.value || searchResults.value.length === 0) return [];
  
  // Create a copy to avoid mutating original array
  const results = [...searchResults.value];
  
  switch (sortBy.value) {
    case 'title-asc':
      return results.sort((a, b) => (a.title || '').localeCompare(b.title || ''));
    case 'title-desc':
      return results.sort((a, b) => (b.title || '').localeCompare(a.title || ''));
    case 'likes-desc':
      return results.sort((a, b) => (b.aggregateLikes || 0) - (a.aggregateLikes || 0));
    case 'likes-asc':
      return results.sort((a, b) => (a.aggregateLikes || 0) - (b.aggregateLikes || 0));
    case 'time-asc':
      return results.sort((a, b) => (a.readyInMinutes || 0) - (b.readyInMinutes || 0));
    case 'time-desc':
      return results.sort((a, b) => (b.readyInMinutes || 0) - (a.readyInMinutes || 0));
    case 'default':
    default:
      return results; // Keep original server order
  }
});

// Event handlers for user interactions with recipes
const handleLikeToggled = (event) => {
  console.log('SearchPage: Like toggled:', event);
  
  // Update store
  if (event.newState) {
    store.addToLiked(event.recipeId);
  } else {
    store.removeFromLiked(event.recipeId);
  }
  
  // Update the like count in search results immediately
  const recipe = searchResults.value.find(r => r.id === event.recipeId);
  if (recipe) {
    recipe.aggregateLikes = (recipe.aggregateLikes || 0) + (event.newState ? 1 : -1);
  }
  
  // Force Vue to update
  searchResults.value = [...searchResults.value];
};

const handleFavoriteToggled = (event) => {
  console.log('SearchPage: Favorite toggled:', event);
  
  // Update store
  if (event.newState) {
    store.addToFavorites(event.recipeId);
  } else {
    store.removeFromFavorites(event.recipeId);
  }
  
  // Force Vue to update
  searchResults.value = [...searchResults.value];
};

// Main search function with caching support
const handleSearch = async () => {
  hasSearched.value = true;
  sortBy.value = 'default';
  
  try {
    // Prepare search parameters
    const searchParams = {
      title: searchForm.title || undefined,
      cuisine: searchForm.cuisine || undefined,
      diet: searchForm.diet || undefined,
      intolerances: searchForm.intolerances.length > 0 ? searchForm.intolerances : undefined,
      amount: parseInt(searchForm.amount)
    };

    // Remove undefined values
    Object.keys(searchParams).forEach(key => {
      if (searchParams[key] === undefined) {
        delete searchParams[key];
      }
    });

    // Check if we have cached results for the same search parameters
    const cachedSearch = store.getCachedSearchData();
    if (cachedSearch && areSearchParamsEqual(cachedSearch.params, searchParams)) {
      console.log('SearchPage: Using cached search results');
      searchResults.value = cachedSearch.results;
      return;
    }

    // Use composable to search for recipe IDs
    const recipeIds = await searchRecipes(searchParams);

    // Fetch full recipe details for each ID
    if (recipeIds.length > 0) {
      const recipePromises = recipeIds.map(async (recipeId) => {
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
      const filteredResults = fetchedRecipes.filter(recipe => recipe !== null);
      
      searchResults.value = filteredResults;
      
      // Cache the search results
      store.cacheSearchData(filteredResults, searchParams);
    } else {
      searchResults.value = [];
      // Cache empty results too
      store.cacheSearchData([], searchParams);
    }

  } catch (err) {
    console.error('Error searching recipes:', err);
    searchResults.value = [];
  }
};

// Load cached search on mount and initialize user data
onMounted(async () => {
  console.log('SearchPage: onMounted called');

  // Load user's favorites and likes first
  await loadUserData();
  
  // Check if referrer is from the same origin (internal navigation)
  const cameFromApp = document.referrer && 
                      document.referrer.includes(window.location.origin);
  
  console.log('SearchPage: Navigation context:', {
    cameFromApp,
    referrer: document.referrer
  });
  
  // Load cached search if available
  const cachedSearch = store.getCachedSearchData();
  if (cachedSearch) {
    console.log('SearchPage: Loading cached search results');
    searchResults.value = cachedSearch.results;
    hasSearched.value = true;
    
    // Restore search form from cached params
    if (cachedSearch.params) {
      searchForm.title = cachedSearch.params.title || '';
      searchForm.cuisine = cachedSearch.params.cuisine || '';
      searchForm.diet = cachedSearch.params.diet || '';
      searchForm.intolerances = cachedSearch.params.intolerances || [];
      searchForm.amount = cachedSearch.params.amount || 5;
    }
  }
});
</script>

<style scoped>
.container {
  max-width: 1200px;
}

.card {
  box-shadow: 0 2px 4px rgba(0,0,0,0.1);
}

.form-label {
  font-weight: 600;
  color: #495057;
}

.btn-primary {
  background-color: #3498db;
  border-color: #3498db;
}

.btn-primary:hover {
  background-color: #2980b9;
  border-color: #2980b9;
}

h1, h2 {
  color: #2c3e50;
}

.spinner-border-sm {
  width: 1rem;
  height: 1rem;
}
</style>