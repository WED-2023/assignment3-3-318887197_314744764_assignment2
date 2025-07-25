<template>
  <div class="create-recipe-form">
    <div class="form-container">
      <form @submit.prevent="$emit('submit')">
        <!-- Recipe Type Toggle -->
        <div class="mb-4">
          <div class="form-check form-switch">
            <input
              class="form-check-input"
              type="checkbox"
              id="isFamilyRecipe"
              :checked="recipe.isFamilyRecipe"
              @change="updateField('isFamilyRecipe', $event.target.checked)"
            />
            <label class="form-check-label fw-bold" for="isFamilyRecipe">
              <i class="fas fa-heart me-2 text-danger"></i>
              Family Recipe
            </label>
          </div>
          <small class="text-muted">
            Family recipes include special family history and occasion details
          </small>
        </div>

        <!-- Basic Recipe Info -->
        <div class="row">
          <div class="col-md-6 mb-3">
            <label for="title" class="form-label">Recipe Title *</label>
            <input
              type="text"
              class="form-control"
              :class="{ 'is-invalid': showValidation && !validation.title }"
              id="title"
              :value="recipe.title"
              @input="updateField('title', $event.target.value)"
              required
              placeholder="Enter recipe title"
            />
            <div v-if="showValidation && !validation.title" class="invalid-feedback">
              Recipe title is required
            </div>
          </div>
          <div class="col-md-6 mb-3">
            <label for="image" class="form-label">Image URL *</label>
            <input
              type="url"
              class="form-control"
              :class="{ 'is-invalid': showValidation && !validation.image }"
              id="image"
              :value="recipe.image"
              @input="updateField('image', $event.target.value)"
              required
              placeholder="https://potat.com/potat.jpg"
            />
            <div v-if="showValidation && !validation.image" class="invalid-feedback">
              Valid image URL is required
            </div>
          </div>
        </div>

        <div class="row">
          <div class="col-md-4 mb-3">
            <label for="readyInMinutes" class="form-label">Ready in Minutes *</label>
            <input
              type="number"
              class="form-control"
              :class="{ 'is-invalid': showValidation && !validation.readyInMinutes }"
              id="readyInMinutes"
              :value="recipe.readyInMinutes"
              @input="updateField('readyInMinutes', Number($event.target.value))"
              required
              min="1"
              placeholder="30"
            />
            <div v-if="showValidation && !validation.readyInMinutes" class="invalid-feedback">
              Time must be greater than 0
            </div>
          </div>
          <div class="col-md-4 mb-3">
            <label for="servings" class="form-label">Servings *</label>
            <input
              type="number"
              class="form-control"
              :class="{ 'is-invalid': showValidation && !validation.servings }"
              id="servings"
              :value="recipe.servings"
              @input="updateField('servings', Number($event.target.value))"
              required
              min="1"
              placeholder="4"
            />
            <div v-if="showValidation && !validation.servings" class="invalid-feedback">
              Servings must be greater than 0
            </div>
          </div>
        </div>

        <!-- Diet Options -->
        <div class="mb-3">
          <label class="form-label">Diet Options</label>
          <div class="form-check-group">
            <div class="form-check">
              <input
                class="form-check-input diet-checkbox"
                type="checkbox"
                id="vegetarian"
                :checked="recipe.vegetarian"
                @change="updateField('vegetarian', $event.target.checked)"
              />
              <label class="form-check-label" for="vegetarian">
                Vegetarian 🥦
              </label>
            </div>
            <div class="form-check">
              <input
                class="form-check-input diet-checkbox"
                type="checkbox"
                id="vegan"
                :checked="recipe.vegan"
                @change="updateField('vegan', $event.target.checked)"
              />
              <label class="form-check-label" for="vegan">
                Vegan 🌱
              </label>
            </div>
            <div class="form-check">
              <input
                class="form-check-input diet-checkbox"
                type="checkbox"
                id="glutenFree"
                :checked="recipe.glutenFree"
                @change="updateField('glutenFree', $event.target.checked)"
              />
              <label class="form-check-label" for="glutenFree">
                Gluten Free 🚫🌾
              </label>
            </div>
          </div>
        </div>

        <!-- Family Recipe Section (Conditional) -->
        <div v-if="recipe.isFamilyRecipe" class="family-recipe-section mb-4">
          <div class="card">
            <div class="card-header bg-light">
              <h6 class="mb-0">
                <i class="fas fa-heart text-danger me-2"></i>
                Family Recipe Details
              </h6>
            </div>
            <div class="card-body">
              <div class="row">
                <div class="col-md-6 mb-3">
                  <label for="family_creator" class="form-label">Family Creator *</label>
                  <input
                    type="text"
                    class="form-control"
                    :class="{ 'is-invalid': showValidation && !validation.family_creator }"
                    id="family_creator"
                    :value="recipe.family_creator"
                    @input="updateField('family_creator', $event.target.value)"
                    required
                    placeholder="e.g., Grandma Sarah, Uncle Mike"
                  />
                  <div v-if="showValidation && !validation.family_creator" class="invalid-feedback">
                    Family creator is required for family recipes
                  </div>
                </div>
                <div class="col-md-6 mb-3">
                  <label for="family_occasion" class="form-label">Family Occasion *</label>
                  <input
                    type="text"
                    class="form-control"
                    :class="{ 'is-invalid': showValidation && !validation.family_occasion }"
                    id="family_occasion"
                    :value="recipe.family_occasion"
                    @input="updateField('family_occasion', $event.target.value)"
                    required
                    placeholder="e.g., Christmas dinner, Birthday celebrations"
                  />
                  <div v-if="showValidation && !validation.family_occasion" class="invalid-feedback">
                    Family occasion is required for family recipes
                  </div>
                </div>
              </div>

              <!-- Family Pictures -->
              <div class="mb-3">
                <label class="form-label">Family Pictures</label>
                <div v-for="(picture, index) in recipe.family_pictures" :key="index" class="input-group mb-2">
                  <input
                    type="url"
                    class="form-control"
                    :class="{ 'is-invalid': showValidation && picture && !isValidUrl(picture) }"
                    :value="picture"
                    @input="updateFamilyPicture(index, $event.target.value)"
                    :placeholder="`Family picture URL ${index + 1}`"
                  />
                  <button
                    type="button"
                    class="btn btn-outline-danger"
                    @click="removeFamilyPicture(index)"
                    v-if="recipe.family_pictures.length > 1"
                  >
                    <i class="fas fa-trash"></i>
                  </button>
                </div>
                <div v-if="showValidation && hasInvalidFamilyPictures" class="invalid-feedback d-block">
                  Please provide valid picture URLs
                </div>
                <button
                  type="button"
                  class="btn btn-outline-primary btn-sm"
                  @click="addFamilyPicture"
                >
                  <i class="fas fa-plus"></i> Add Family Picture
                </button>
                <small class="form-text text-muted d-block mt-1">
                  Add URLs to family photos related to this recipe (optional)
                </small>
              </div>
            </div>
          </div>
        </div>
        
        <!-- Ingredients -->
        <div class="mb-3">
          <label class="form-label">Ingredients *</label>
          <div v-for="(ingredient, index) in recipe.ingredients" :key="index" class="ingredient-row mb-3">
            <div class="row">
              <div class="col-md-4">
                <input
                  type="text"
                  class="form-control"
                  :class="{ 'is-invalid': showValidation && !isIngredientValid(ingredient) && (!ingredient[0] || ingredient[0].trim() === '') }"
                  :value="ingredient[0] || ''"
                  @input="updateIngredientField(index, 0, $event.target.value)"
                  placeholder="Ingredient name *"
                  required
                />
                <div v-if="showValidation && !isIngredientValid(ingredient) && (!ingredient[0] || ingredient[0].trim() === '')" class="invalid-feedback">
                  Ingredient name is required
                </div>
              </div>
              <div class="col-md-3">
                <input
                  type="number"
                  class="form-control"
                  :class="{ 'is-invalid': showValidation && !isIngredientValid(ingredient) && (!ingredient[1] || ingredient[1] <= 0) }"
                  :value="ingredient[1] || ''"
                  @input="updateIngredientField(index, 1, Number($event.target.value))"
                  step="0.01"
                  min="0"
                  placeholder="Amount *"
                  required
                />
                <div v-if="showValidation && !isIngredientValid(ingredient) && (!ingredient[1] || ingredient[1] <= 0)" class="invalid-feedback">
                  Amount must be greater than 0
                </div>
              </div>
              <div class="col-md-4">
                <input
                  type="text"
                  class="form-control"
                  :class="{ 'is-invalid': showValidation && !isIngredientValid(ingredient) && (!ingredient[2] || ingredient[2].trim() === '') }"
                  :value="ingredient[2] || ''"
                  @input="updateIngredientField(index, 2, $event.target.value)"
                  placeholder="Unit (cup, tsp, etc.) *"
                  required
                />
                <div v-if="showValidation && !isIngredientValid(ingredient) && (!ingredient[2] || ingredient[2].trim() === '')" class="invalid-feedback">
                  Unit is required
                </div>
              </div>
              <div class="col-md-1">
                <button
                  type="button"
                  class="btn btn-outline-danger w-100"
                  @click="removeIngredient(index)"
                  v-if="recipe.ingredients.length > 1"
                >
                  <i class="fas fa-trash"></i>
                </button>
              </div>
            </div>
          </div>
          <div v-if="showValidation && !validation.ingredients" class="invalid-feedback d-block">
            Please complete all ingredient fields
          </div>
          <button
            type="button"
            class="btn btn-outline-primary btn-sm"
            @click="addIngredient"
          >
            <i class="fas fa-plus"></i> Add Ingredient
          </button>
        </div>

        <!-- Instructions -->
        <div class="mb-3">
          <label for="instructions" class="form-label">Instructions *</label>
          <textarea
            class="form-control"
            :class="{ 'is-invalid': showValidation && !validation.instructions }"
            id="instructions"
            :value="recipe.instructions"
            @input="updateField('instructions', $event.target.value)"
            rows="6"
            required
            placeholder="Enter step-by-step cooking instructions..."
          ></textarea>
          <div v-if="showValidation && !validation.instructions" class="invalid-feedback">
            Instructions are required
          </div>
        </div>
      </form>
    </div>
  </div>
</template>

<script setup>
import { computed } from 'vue';

// Component props - recipe data and validation state
const props = defineProps({
  recipe: {
    type: Object,
    required: true
  },
  showValidation: {
    type: Boolean,
    default: false
  }
});

// Component events
const emit = defineEmits(['submit', 'showValidation', 'updateRecipe']);

// URL validation helper
const isValidUrl = (string) => {
  if (!string || string.trim() === '') return false;
  try {
    new URL(string);
    return true;
  } catch (_) {
    return false;
  }
};

// Check if any family pictures are invalid
const hasInvalidFamilyPictures = computed(() => {
  if (!props.recipe.family_pictures) return false;
  return props.recipe.family_pictures.some(pic => pic && pic.trim() !== '' && !isValidUrl(pic));
});

// Individual field validations
const validation = computed(() => ({
  title: props.recipe.title && props.recipe.title.trim() !== '',
  readyInMinutes: props.recipe.readyInMinutes && props.recipe.readyInMinutes > 0,
  servings: props.recipe.servings && props.recipe.servings > 0,
  ingredients: props.recipe.ingredients && props.recipe.ingredients.every(ing => 
    ing && ing[0] && ing[0].trim() !== '' && 
    ing[1] && ing[1] > 0 && 
    ing[2] && ing[2].trim() !== ''
  ), 
  instructions: props.recipe.instructions && props.recipe.instructions.trim() !== '',
  image: props.recipe.image && props.recipe.image.trim() !== '' && isValidUrl(props.recipe.image),
  family_creator: !props.recipe.isFamilyRecipe || (props.recipe.family_creator && props.recipe.family_creator.trim() !== ''),
  family_occasion: !props.recipe.isFamilyRecipe || (props.recipe.family_occasion && props.recipe.family_occasion.trim() !== '')
}));

// Add individual ingredient validation
const isIngredientValid = (ingredient) => {
  return ingredient && 
         ingredient[0] && ingredient[0].trim() !== '' && 
         ingredient[1] && ingredient[1] > 0 && 
         ingredient[2] && ingredient[2].trim() !== '';
};

// Overall form validation
const isFormValid = computed(() => {
  return validation.value.title &&
         validation.value.readyInMinutes &&
         validation.value.servings &&
         validation.value.ingredients &&
         validation.value.instructions &&
         validation.value.image &&
         validation.value.family_creator &&
         validation.value.family_occasion &&
         !hasInvalidFamilyPictures.value;
});

// Update field helper
const updateField = (field, value) => {
  const updatedRecipe = { ...props.recipe, [field]: value };
  
  // If toggling family recipe off, clear family fields
  if (field === 'isFamilyRecipe' && !value) {
    updatedRecipe.family_creator = '';
    updatedRecipe.family_occasion = '';
    updatedRecipe.family_pictures = [''];
  }
  // If toggling family recipe on, initialize family pictures if empty
  else if (field === 'isFamilyRecipe' && value && (!props.recipe.family_pictures || props.recipe.family_pictures.length === 0)) {
    updatedRecipe.family_pictures = [''];
  }
  
  emit('updateRecipe', updatedRecipe);
};

// Update ingredient helper
const updateIngredientField = (index, fieldIndex, value) => {
  const newIngredients = [...props.recipe.ingredients];
  if (!newIngredients[index]) {
    newIngredients[index] = ['', '', ''];
  }
  newIngredients[index][fieldIndex] = value;
  emit('updateRecipe', { ...props.recipe, ingredients: newIngredients });
};

// Add new empty ingredient row
const addIngredient = () => {
  const newIngredients = [...props.recipe.ingredients, ['', '', '']];
  emit('updateRecipe', { ...props.recipe, ingredients: newIngredients });
};

// Remove ingredient at specific index
const removeIngredient = (index) => {
  if (props.recipe.ingredients.length > 1) {
    const newIngredients = props.recipe.ingredients.filter((_, i) => i !== index);
    emit('updateRecipe', { ...props.recipe, ingredients: newIngredients });
  }
};

// Family pictures helpers
const updateFamilyPicture = (index, value) => {
  const newPictures = [...props.recipe.family_pictures];
  newPictures[index] = value;
  emit('updateRecipe', { ...props.recipe, family_pictures: newPictures });
};

// Add new empty family picture field
const addFamilyPicture = () => {
  const newPictures = [...props.recipe.family_pictures, ''];
  emit('updateRecipe', { ...props.recipe, family_pictures: newPictures });
};

// Remove family picture at specific index
const removeFamilyPicture = (index) => {
  if (props.recipe.family_pictures.length > 1) {
    const newPictures = props.recipe.family_pictures.filter((_, i) => i !== index);
    emit('updateRecipe', { ...props.recipe, family_pictures: newPictures });
  }
};

// Expose validation state to parent
defineExpose({
  isFormValid,
  validation
});
</script>

<style scoped>
.create-recipe-form {
  max-width: 900px;
  margin: 0 auto;
}

.form-container {
  padding: 1rem;
  background: #ffffff;
  border-radius: 0.5rem;
}

.form-check-group {
  display: flex;
  gap: 1rem;
  flex-wrap: wrap;
  padding-left: 0.25rem;
}

.form-check {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  margin-bottom: 0.25rem;
}

.input-group {
  display: flex;
  gap: 0.5rem;
}

.input-group .form-control {
  flex: 1;
}

.is-invalid {
  border-color: #dc3545;
  box-shadow: 0 0 0 0.2rem rgba(220, 53, 69, 0.25);
}

.invalid-feedback {
  display: block;
  width: 100%;
  margin-top: 0.25rem;
  font-size: 0.875rem;
  color: #dc3545;
}

.family-recipe-section {
  animation: slideDown 0.3s ease-out;
}

@keyframes slideDown {
  from {
    opacity: 0;
    max-height: 0;
    overflow: hidden;
  }
  to {
    opacity: 1;
    max-height: 500px;
  }
}

/* ALL checkboxes - blue */
.form-check-input:checked {
  background-color: #0d6efd !important;
  border-color: #0d6efd !important;
}

.card-header {
  border-bottom: 1px solid #dee2e6;
}

.ingredient-row {
  padding: 1rem;
  border: 1px solid #e9ecef;
  border-radius: 0.375rem;
  background-color: #f8f9fa;
  margin: 0.25rem 0;
}

.ingredient-row:hover {
  background-color: #e9ecef;
}

/* Add spacing to form elements */
.form-control, .form-select {
  margin-bottom: 0.5rem;
}

.form-label {
  margin-bottom: 0.25rem;
  font-weight: 500;
   font-size: 0.9rem; /* Slightly smaller labels */
}

/* Reduce spacing between form groups */
.mb-3 {
  margin-bottom: 1rem !important; /* Reduced from default 1rem to 0.75rem */
}

.mb-4 {
  margin-bottom: 1.25rem !important; /* Reduced from default 1.5rem */
}


/* Better title styling */
.form-check-label.fw-bold {
  font-size: 1rem;
  font-weight: 600;
  color: #495057;
}

.form-check-label.fw-bold i {
  font-size: 0.9rem;
}

/* Tighter row spacing */
.row {
  margin-bottom: 0.5rem;
}

.row .col-md-6,
.row .col-md-4 {
  padding-bottom: 0.5rem;
}

</style>