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
                <option value="Italian">Italian</option>
                <option value="Mexican">Mexican</option>
                <option value="Asian">Asian</option>
                <option value="American">American</option>
                <option value="French">French</option>
                <option value="Indian">Indian</option>
              </select>
            </div>
          </div>
          
          <div class="row">
            <div class="col-md-6 mb-3">
              <label for="diet" class="form-label">Diet</label>
              <select class="form-select" id="diet" v-model="searchForm.diet">
                <option value="">Any Diet</option>
                <option value="Vegan">Vegan</option>
                <option value="Vegetarian">Vegetarian</option>
                <option value="Gluten Free">Gluten Free</option>
                <option value="Ketogenic">Ketogenic</option>
                <option value="Pescetarian">Pescetarian</option>
                <option value="Paleo">Paleo</option>
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
            <label class="form-label">Intolerances</label>
            <div class="row">
              <div class="col-md-3" v-for="intolerance in availableIntolerances" :key="intolerance">
                <div class="form-check">
                  <input
                    class="form-check-input"
                    type="checkbox"
                    :id="intolerance"
                    :value="intolerance"
                    v-model="searchForm.intolerances"
                  />
                  <label class="form-check-label" :for="intolerance">
                    {{ intolerance }}
                  </label>
                </div>
              </div>
            </div>
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
import { ref, reactive } from 'vue';
import { RecipeAPI } from '@/composables/RecipeAPI';
import RecipePreview from '@/components/RecipePreview.vue';

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

const availableIntolerances = [
  'Dairy', 'Egg', 'Gluten', 'Grain', 'Peanut', 'Seafood', 'Sesame', 'Shellfish', 'Soy', 'Sulfite', 'Tree Nut', 'Wheat'
];

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
      searchResults.value = fetchedRecipes.filter(recipe => recipe !== null);
    } else {
      searchResults.value = [];
    }

  } catch (err) {
    console.error('Error searching recipes:', err);
    searchResults.value = [];
  }
};
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