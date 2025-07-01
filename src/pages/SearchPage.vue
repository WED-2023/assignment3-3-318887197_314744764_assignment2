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
      <h2 class="mb-3">Search Results ({{ searchResults.length }} found)</h2>
      <div class="row">
        <div v-for="recipe in searchResults" :key="recipe.id" class="col-md-4 mb-4">
          <RecipePreview :recipe="recipe" />
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
import { ref, reactive, onMounted } from 'vue'; // Add onMounted
import { RecipeAPI } from '@/composables/RecipeAPI';
import RecipePreview from '@/components/RecipePreview.vue';
import store from '@/store';

// Use composables
const { searchRecipes, getRecipeInfo, isLoading: searchLoading, error: searchError } = RecipeAPI();

// Reactive data
const searchResults = ref([]);
const hasSearched = ref(false);

const searchForm = reactive({
  title: '',
  cuisine: '',
  diet: '',
  intolerances: [],
  amount: 5
});

// Helper function to compare search parameters
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

const handleSearch = async () => {
  hasSearched.value = true;
  
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

// Load cached search on mount
onMounted(() => {
  console.log('SearchPage: onMounted called');
  
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