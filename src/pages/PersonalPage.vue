<template>
  <RecipePage
    title="My Personal Recipes"
    description="All your personal recipes that you've created."
    :recipes="recipes"
    :watchedRecipeIds="watchedRecipeIds"
    :likedRecipeIds="likedRecipeIds"
    :favoriteRecipeIds="favoriteRecipeIds"
    :isLoading="isLoading"
    :error="error"
    emptyMessage="You haven't created any personal recipes yet. Start creating to build your collection!"
    :onRetry="fetchPersonalRecipes"
    @favoriteToggled="handleFavoriteToggled"
    @likeToggled="handleLikeToggled"
  >
    <template #empty-action>
      <button 
        class="cta-button" 
        @click="showCreateModal = true"
        type="button"
      >
        Create Recipe
      </button>
    </template>

    <!-- Create button when there ARE recipes -->
    <template #header-action>
      <button 
        class="cta-button" 
        @click="showCreateModal = true"
        type="button"
      >
        <i class="fas fa-plus me-2"></i>
        Create New Recipe
      </button>
    </template>
  </RecipePage>

  <!-- Create Recipe Modal -->
  <div v-if="showCreateModal" class="modal-backdrop">
    <div class="modal-dialog" @click.stop>
      <div class="modal-content">
        <div class="modal-header">
          <h5 class="modal-title">Create New Recipe</h5>
          <button type="button" class="btn-close" @click="closeModal">&times;</button>
        </div>
        <div class="modal-body">
          <CreateRecipeForm
            ref="recipeFormRef"
            :recipe="newRecipe"
            :showValidation="showValidation"
            @submit="createRecipe"
            @updateRecipe="newRecipe = $event"
          />
        </div>
        <div class="modal-footer">
          <!-- Validation Summary -->
          <div v-if="showValidation && !isFormValid" class="validation-summary me-auto">
            <small class="text-danger">
              <i class="fas fa-exclamation-triangle me-1"></i>
              Please fix the highlighted fields above
            </small>
          </div>
          
          <button type="button" class="btn btn-secondary" @click="closeModal">
            Cancel
          </button>
          <button 
            type="button" 
            class="btn btn-primary" 
            @click="createRecipe"
            :disabled="isCreating || (showValidation && !isFormValid)"
          >
            <span v-if="isCreating" class="spinner-border spinner-border-sm me-2"></span>
            {{ isCreating ? 'Creating...' : 'Create Recipe' }}
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted, computed } from 'vue';
import { useRouter } from 'vue-router';
import RecipePage from '@/components/RecipePage.vue';
import CreateRecipeForm from '@/components/CreateRecipeForm.vue';
import store from '@/store';
import { RecipeAPI } from '@/composables/RecipeAPI';
import { MyRecipesAPI } from '@/composables/MyRecipesAPI';
import { UserData } from '@/composables/UserData';

// Router instance for navigation
const router = useRouter();

// Use composables
const { getRecipeInfo } = RecipeAPI();                      // Get detailed recipe information
const { getMyRecipes, addMyRecipe } = MyRecipesAPI();       // Personal recipe management
const { watchedRecipeIds, likedRecipeIds, favoriteRecipeIds, fetchUserData } = UserData();  // User interaction data

// Reactive data
const recipes = ref([]);                                    // Array of personal recipes
const isLoading = ref(false);                              // Loading state for API calls
const error = ref('');                                     // Error message storage
const showCreateModal = ref(false);                        // Modal visibility control
const isCreating = ref(false);                             // Creation process loading state
const showValidation = ref(false);                         // Form validation display control
const recipeFormRef = ref(null);                           // Reference to form component

// New recipe form data
const newRecipe = ref({
  title: '',
  readyInMinutes: null,
  servings: null,
  glutenFree: false,
  vegan: false,
  vegetarian: false,
  ingredients: [['', '', '']], // Change to array format
  instructions: '',
  image: '',
  isFamilyRecipe: false,     
  family_creator: '',
  family_occasion: '',
  family_pictures: ['']      
});

// Get validation state from form component
const isFormValid = computed(() => {
  return recipeFormRef.value?.isFormValid || false;
});

// Check auth - redirect to login if not authenticated
if (!store.username) {
  router.push({ name: 'login' });
}

// Event handlers (matching FavoritePage pattern)
const handleFavoriteToggled = (event) => {
  const { recipeId, newState } = event;
  console.log('PersonalPage: Favorite toggled', { recipeId, newState });
  
  if (newState) {
    // Add to favorites if not already there
    if (!favoriteRecipeIds.value.includes(String(recipeId))) {
      favoriteRecipeIds.value.push(String(recipeId));
    }
  } else {
    // Remove from favorites
    favoriteRecipeIds.value = favoriteRecipeIds.value.filter(id => String(id) !== String(recipeId));
  }
};

const handleLikeToggled = (event) => {
  const { recipeId, newState } = event;
  console.log('PersonalPage: Like toggled', { recipeId, newState });
  
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

// Modal functions
const closeModal = () => {
  showCreateModal.value = false;
  resetForm();
};

const resetForm = () => {
  newRecipe.value = {
    title: '',
    readyInMinutes: null,
    servings: null,
    glutenFree: false,
    vegan: false,
    vegetarian: false,
    ingredients: [['', '', '']], // Change to array format
    instructions: '',
    image: '',
    isFamilyRecipe: false,    
    family_creator: '',
    family_occasion: '',
    family_pictures: ['']       
  };
  showValidation.value = false;
};

const createRecipe = async () => {
  showValidation.value = true;
  
  // Exit early if form is invalid
  if (!isFormValid.value) {
    return;
  }

  isCreating.value = true;

  try {
    // Prepare recipe data
    const recipeData = {
      title: newRecipe.value.title.trim(),
      readyInMinutes: newRecipe.value.readyInMinutes,
      servings: newRecipe.value.servings,
      glutenFree: newRecipe.value.glutenFree,
      vegan: newRecipe.value.vegan,
      vegetarian: newRecipe.value.vegetarian,
      // Filter out empty ingredients and clean up the data
      ingredients: newRecipe.value.ingredients
        .filter(ing => ing[0] && ing[0].trim() !== '' && ing[1] && ing[1] > 0)
        .map(ing => [
          ing[0].trim(),  // name
          ing[1],         // amount (number)
          ing[2] ? ing[2].trim() : ''  // unit (string)
        ]),
      instructions: newRecipe.value.instructions.trim(),
      image: newRecipe.value.image.trim(),
      isFamilyRecipe: newRecipe.value.isFamilyRecipe,
      family_creator: newRecipe.value.family_creator.trim() || null,
      family_occasion: newRecipe.value.family_occasion.trim() || null,
      family_pictures: (newRecipe.value.family_pictures || []).filter(pic => pic.trim() !== '') || null // ADD NULL CHECK
    };

    // Create the recipe
    const newRecipeId = await addMyRecipe(recipeData);
    console.log('PersonalPage: Recipe created successfully with ID:', newRecipeId);

    // Close modal and refresh recipes
    closeModal();
    await fetchPersonalRecipes();

    // Navigate to appropriate page based on recipe type
    if (recipeData.isFamilyRecipe) {
      router.push({ name: 'familia' });
    } else {
      router.push({ name: 'personal' });
    }

  } catch (err) {
    console.error('Error creating recipe:', err);
    alert('Failed to create recipe. Please try again.');
  } finally {
    isCreating.value = false;
  }
};

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
          // Extract the actual ID from the object
          const actualId = recipeId.recipe_id; // Unpack here
          const recipeData = await getRecipeInfo(actualId);
          return {
            id: actualId,
            ...recipeData
          };
        } catch (error) {
          console.error(`Error fetching recipe ${recipeId}:`, error);
          return null;
        }
      });
      
      // Wait for all recipe fetches to complete
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

// Initialize data when component mounts
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

/* Modal Styles */
.modal-backdrop {
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background-color: rgba(0, 0, 0, 0.5);
  display: flex;
  justify-content: center;
  align-items: center;
  z-index: 9999;
  /* Removed @click handler - no outside click closing */
}

.modal-dialog {
  max-width: 800px;
  width: 90%;
  max-height: 90vh;
  overflow-y: auto;
}

.modal-content {
  background: white;
  border-radius: 0.5rem;
  box-shadow: 0 10px 25px rgba(0, 0, 0, 0.2);
}

.modal-header {
  padding: 1rem 1.5rem;
  border-bottom: 1px solid #e5e7eb;
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.modal-title {
  margin: 0;
  font-size: 1.25rem;
  font-weight: 600;
}

.btn-close {
  background: none;
  border: none;
  font-size: 1.5rem;
  cursor: pointer;
  padding: 0;
  width: 30px;
  height: 30px;
  display: flex;
  align-items: center;
  justify-content: center;
}

.modal-body {
  padding: 1.5rem;
  max-height: 60vh;
  overflow-y: auto;
}

.modal-footer {
  padding: 1rem 1.5rem;
  border-top: 1px solid #e5e7eb;
  display: flex;
  justify-content: flex-end;
  align-items: center;
  gap: 0.5rem;
}

/* Validation Styles */
.validation-summary {
  display: flex;
  align-items: center;
}
</style>