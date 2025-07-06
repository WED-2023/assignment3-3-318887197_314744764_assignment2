<template>
  <div class="recipe-page">
    <div class="container">
      <!-- Page Header -->
      <div class="page-header">
        <div class="header-content">
          <h1 class="page-title">{{ title }}</h1>
          <p v-if="description" class="page-description">{{ description }}</p>
        </div>
        <div class="header-actions">
          <slot name="header-action"></slot>
        </div>
      </div>
      
      <!-- Loading State -->
      <div v-if="isLoading" class="loading-state">
        <div class="loading-spinner"></div>
        <p>Loading recipes...</p>
      </div>
      
      <!-- Error State -->
      <div v-else-if="error" class="error-state">
        <div class="error-icon">⚠️</div>
        <p class="error-message">{{ error }}</p>
        <button v-if="onRetry" @click="onRetry" class="retry-btn">Try Again</button>
      </div>
      
      <!-- Empty State -->
      <div v-else-if="recipes.length === 0 && !isLoading" class="empty-state">
        <div class="empty-icon">📝</div>
        <p class="empty-message">{{ emptyMessage || 'No recipes found.' }}</p>
        <slot name="empty-action"></slot>
      </div>
      
      <!-- Recipes Display -->
      <div v-else class="recipes-container">
        <RecipePreviewList 
          :title="listTitle || title"
          :recipes="recipes"
          :watchedRecipeIds="watchedRecipeIds"
          :likedRecipeIds="likedRecipeIds"
          :favoriteRecipeIds="favoriteRecipeIds"
          @favoriteToggled="handleFavoriteToggled"
          @likeToggled="handleLikeToggled"
          class="recipe-list"
        />
      </div>
      
      <!-- Additional Actions Slot -->
      <div v-if="$slots.actions" class="page-actions">
        <slot name="actions"></slot>
      </div>
    </div>
  </div>
</template>

<script setup>
import RecipePreviewList from './RecipePreviewList.vue';

// Component props definition - all the data and configuration this component needs
defineProps({
  // Main page title displayed at the top
  title: {
    type: String,
    required: true
  },
  // Optional description text shown below the title
  description: {
    type: String,
    default: ''
  },
  // Array of recipe objects to display
  recipes: {
    type: Array,
    default: () => []
  },
  // Array of recipe IDs that user has already viewed
  watchedRecipeIds: {
    type: Array,
    default: () => []
  },
  // Array of recipe IDs that user has liked
  likedRecipeIds: {
    type: Array,
    default: () => []
  },
  // Array of recipe IDs that user has marked as favorites
  favoriteRecipeIds: {
    type: Array,
    default: () => []
  },
  // Loading state flag to show spinner
  isLoading: {
    type: Boolean,
    default: false
  },
  // Error message to display when something goes wrong
  error: {
    type: String,
    default: ''
  },
  // Custom message to show when no recipes are found
  emptyMessage: {
    type: String,
    default: ''
  },
  // Override title for the recipe list if different from page title
  listTitle: {
    type: String,
    default: ''
  },
  // Function to call when user clicks retry button after error
  onRetry: {
    type: Function,
    default: null
  }
});

// Events that this component can emit to parent components
const emit = defineEmits(['favoriteToggled', 'likeToggled']);

// Handle when user toggles favorite status on a recipe
const handleFavoriteToggled = (event) => {
  emit('favoriteToggled', event);
};

// Handle when user toggles like status on a recipe
const handleLikeToggled = (event) => {
  emit('likeToggled', event);
};
</script>

<style scoped>
.recipe-page {
  min-height: calc(100vh - 50px);
  padding: 2rem 0;
}

.container {
  max-width: 1200px;
  margin: 0 auto;
  padding: 0 1rem;
}

.page-header {
  text-align: center;
  margin-bottom: 2rem;
}

.page-title {
  font-size: 2.5rem;
  font-weight: bold;
  color: #2c3e50;
  margin-bottom: 0.5rem;
}

.page-description {
  font-size: 1.1rem;
  color: #6b7280;
  max-width: 600px;
  margin: 0 auto;
  line-height: 1.6;
}

.loading-state,
.error-state,
.empty-state {
  text-align: center;
  padding: 3rem 1rem;
}

.loading-state {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 1rem;
}

.loading-spinner {
  width: 40px;
  height: 40px;
  border: 4px solid #f3f4f6;
  border-top: 4px solid #14b8a6;
  border-radius: 50%;
  animation: spin 1s linear infinite;
}

@keyframes spin {
  0% { transform: rotate(0deg); }
  100% { transform: rotate(360deg); }
}

.loading-state p {
  font-size: 1.1rem;
  color: #6b7280;
}

.error-state {
  color: #dc2626;
}

.error-icon {
  font-size: 3rem;
  margin-bottom: 1rem;
}

.error-message {
  font-size: 1.1rem;
  margin-bottom: 1.5rem;
  color: #dc2626;
}

.retry-btn {
  background: #14b8a6;
  color: white;
  border: none;
  padding: 0.75rem 1.5rem;
  border-radius: 0.5rem;
  font-weight: 500;
  cursor: pointer;
  transition: background-color 0.2s;
}

.retry-btn:hover {
  background: #0f766e;
}

.empty-state {
  color: #6b7280;
}

.empty-icon {
  font-size: 3rem;
  margin-bottom: 1rem;
}

.empty-message {
  font-size: 1.1rem;
  max-width: 500px;
  margin: 0 auto 1.5rem;
  line-height: 1.6;
}

.recipes-container {
  margin-top: 1rem;
}

.page-actions {
  text-align: center;
  margin-top: 2rem;
  padding-top: 2rem;
  border-top: 1px solid #e5e7eb;
}
</style>