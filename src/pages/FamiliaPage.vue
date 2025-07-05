<template>
  <RecipePage
    title="La Familia Recipes"
    description="Special family recipes with memories and traditions."
    :recipes="recipes"
    :watchedRecipeIds="watchedRecipeIds"
    :likedRecipeIds="likedRecipeIds"
    :favoriteRecipeIds="favoriteRecipeIds"
    :isLoading="isLoading"
    :error="error"
    emptyMessage="You haven't created any family recipes yet. Start creating to build your collection!"
    :onRetry="fetchFamilyRecipes"
    @favoriteToggled="handleFavoriteToggled"
    @likeToggled="handleLikeToggled"
  >
    <template #title-icon>
      <i class="fas fa-heart text-danger me-2"></i>
    </template>

    <template #empty-action>
      <button 
        class="cta-button family-button" 
        @click="showCreateModal = true"
        type="button"
      >
        <i class="fas fa-heart me-2"></i>
        Create Family Recipe
      </button>
    </template>

    <!-- Create button when there ARE recipes -->
    <template #header-action>
      <button 
        class="cta-button family-button" 
        @click="showCreateModal = true"
        type="button"
      >
        <i class="fas fa-plus me-2"></i>
        Create New Family Recipe
      </button>
    </template>
  </RecipePage>

  <!-- Create Recipe Modal -->
  <div v-if="showCreateModal" class="modal-backdrop">
    <div class="modal-dialog" @click.stop>
      <div class="modal-content">
        <div class="modal-header">
          <h5 class="modal-title">
            <i class="fas fa-heart text-danger me-2"></i>
            Create New Family Recipe
          </h5>
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
            class="btn btn-danger" 
            @click="createRecipe"
            :disabled="isCreating || (showValidation && !isFormValid)"
          >
            <span v-if="isCreating" class="spinner-border spinner-border-sm me-2"></span>
            <i v-else class="fas fa-heart me-2"></i>
            {{ isCreating ? 'Creating...' : 'Create Family Recipe' }}
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

const router = useRouter();

// Use composables
const { getRecipeInfo } = RecipeAPI();
const { getMyFamilyRecipes, addMyRecipe } = MyRecipesAPI();
const { watchedRecipeIds, likedRecipeIds, favoriteRecipeIds, fetchUserData } = UserData();

// Reactive data
const recipes = ref([]);
const isLoading = ref(false);
const error = ref('');
const showCreateModal = ref(false);
const isCreating = ref(false);
const showValidation = ref(false);
const recipeFormRef = ref(null);

// New recipe form data - pre-configured for family recipes
const newRecipe = ref({
  title: '',
  readyInMinutes: null,
  servings: null,
  glutenFree: false,
  vegan: false,
  vegetarian: false,
  ingredients: [['', '', '']], 
  instructions: '',
  image: '',
  isFamilyRecipe: true,
  family_creator: '',
  family_occasion: '',
  family_pictures: ['']
});

// Get validation state from form component
const isFormValid = computed(() => {
  return recipeFormRef.value?.isFormValid || false;
});

// Check auth
if (!store.username) {
  router.push({ name: 'login' });
}

// Event handlers
const handleFavoriteToggled = (event) => {
  const { recipeId, newState } = event;
  console.log('FamiliaPage: Favorite toggled', { recipeId, newState });
  
  if (newState) {
    if (!favoriteRecipeIds.value.includes(String(recipeId))) {
      favoriteRecipeIds.value.push(String(recipeId));
    }
  } else {
    favoriteRecipeIds.value = favoriteRecipeIds.value.filter(id => String(id) !== String(recipeId));
  }
};

const handleLikeToggled = (event) => {
  const { recipeId, newState } = event;
  console.log('FamiliaPage: Like toggled', { recipeId, newState });
  
  if (newState) {
    if (!likedRecipeIds.value.includes(String(recipeId))) {
      likedRecipeIds.value.push(String(recipeId));
    }
  } else {
    likedRecipeIds.value = likedRecipeIds.value.filter(id => String(id) !== String(recipeId));
  }

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
    ingredients: [['', '', '']], 
    instructions: '',
    image: '',
    isFamilyRecipe: true,
    family_creator: '',
    family_occasion: '',
    family_pictures: ['']
  };
  showValidation.value = false;
};

const createRecipe = async () => {
  showValidation.value = true;
  
  if (!isFormValid.value) {
    return;
  }

  isCreating.value = true;

  try {
    const recipeData = {
      title: newRecipe.value.title.trim(),
      readyInMinutes: newRecipe.value.readyInMinutes,
      servings: newRecipe.value.servings,
      glutenFree: newRecipe.value.glutenFree,
      vegan: newRecipe.value.vegan,
      vegetarian: newRecipe.value.vegetarian,
      ingredients: newRecipe.value.ingredients
        .filter(ing => ing[0] && ing[0].trim() !== '' && ing[1] && ing[1] > 0)
        .map(ing => [
          ing[0].trim(),
          ing[1],
          ing[2] ? ing[2].trim() : ''
        ]),
      instructions: newRecipe.value.instructions.trim(),
      image: newRecipe.value.image.trim(),
      isFamilyRecipe: true,
      family_creator: newRecipe.value.family_creator.trim() || null,
      family_occasion: newRecipe.value.family_occasion.trim() || null,
      family_pictures: (newRecipe.value.family_pictures || []).filter(pic => pic.trim() !== '') || null
    };

    const newRecipeId = await addMyRecipe(recipeData);
    console.log('FamiliaPage: Family recipe created successfully with ID:', newRecipeId);

    closeModal();
    await fetchFamilyRecipes();

  } catch (err) {
    console.error('Error creating family recipe:', err);
    alert('Failed to create family recipe. Please try again.');
  } finally {
    isCreating.value = false;
  }
};

const fetchFamilyRecipes = async () => {
  isLoading.value = true;
  error.value = '';

  try {
    const familyRecipeData = await getMyFamilyRecipes();
    console.log('Raw family recipe data:', familyRecipeData);

    if (familyRecipeData.length > 0) {
      const recipePromises = familyRecipeData.map(async (recipeObj) => {
        try {
          let actualId;
          if (typeof recipeObj === 'string') {
            actualId = recipeObj;
          } else if (recipeObj && recipeObj.recipe_id) {
            actualId = recipeObj.recipe_id;
          } else if (recipeObj && recipeObj.id) {
            actualId = recipeObj.id;
          } else {
            console.warn('Invalid family recipe object:', recipeObj);
            return null;
          }

          console.log('Fetching family recipe with ID:', actualId);
          
          const recipeData = await getRecipeInfo(actualId);
          
          return {
            ...recipeData,
            id: actualId,
            recipe_id: actualId
          };
        } catch (error) {
          console.error(`Error fetching family recipe ${recipeObj?.recipe_id || recipeObj?.id || recipeObj}:`, error);
          return null;
        }
      });
      
      const fetchedRecipes = await Promise.all(recipePromises);
      const validRecipes = fetchedRecipes.filter(recipe => {
        const isValid = recipe !== null && (recipe.id || recipe.recipe_id);
        if (!isValid) {
          console.warn('Filtering out invalid family recipe:', recipe);
        }
        return isValid;
      });
      
      console.log('Final valid family recipes:', validRecipes);
      recipes.value = validRecipes;
    } else {
      recipes.value = [];
    }

    await fetchUserData();

  } catch (err) {
    console.error('Error fetching family recipes:', err);
    if (err.response?.status === 401) {
      error.value = 'You need to be logged in to view your family recipes.';
      router.push({ name: 'login' });
    } else {
      error.value = 'Failed to load your family recipes. Please try again.';
    }
  } finally {
    isLoading.value = false;
  }
};

onMounted(() => {
  fetchFamilyRecipes();
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

.family-button {
  background: #dc3545 !important;
}

.family-button:hover {
  background: #bb2d3b !important;
}

.cta-button.disabled,
.cta-button:disabled {
  background: #9ca3af !important;
  color: #6b7280 !important;
  cursor: not-allowed !important;
  opacity: 0.6;
}

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

.validation-summary {
  display: flex;
  align-items: center;
}
</style>