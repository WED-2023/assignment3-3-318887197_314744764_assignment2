<template>
  <div class="container my-5">
    <div v-if="recipe" class="card shadow-lg">
      <div class="card-header d-flex justify-content-between align-items-center">
        <h1 class="card-title mb-0">{{ recipe.title }}</h1>
        <div v-if="store.username" class="action-buttons d-flex gap-2">
          <!-- Like button -->
          <button 
            @click="handleToggleLike" 
            :class="['btn', 'btn-like', { 'liked': isLiked }]"
            :disabled="likedLoading"
            @mouseenter="showLikeTooltip = true"
            @mouseleave="showLikeTooltip = false"
          >
            <i class="fas fa-thumbs-up"></i>
            {{ isLiked ? 'Unlike' : 'Like' }}
          </button>
          
          <!-- Favorite button -->
          <button 
            @click="handleToggleFavorite" 
            :class="['btn', 'btn-favorite', { 'favorited': isFavorite }]"
            :disabled="favoritesLoading"
            @mouseenter="showFavoriteTooltip = true"
            @mouseleave="showFavoriteTooltip = false"
          >
            <i class="fas fa-star"></i>
            {{ isFavorite ? 'Unfavorite' : 'Favorite' }}
          </button>
          
          <!-- Tooltips -->
          <div v-if="showLikeTooltip" class="tooltip-custom like-tooltip">
            {{ isLiked ? 'Remove your like' : 'Like this recipe' }}
          </div>
          <div v-if="showFavoriteTooltip" class="tooltip-custom favorite-tooltip">
            {{ isFavorite ? 'Remove from favorites' : 'Save to favorites' }}
          </div>
        </div>
      </div>
      
      <div class="card-body">
        <div class="row">
          <div class="col-md-6">
            <img 
              v-if="recipe.image" 
              :src="recipe.image" 
              :alt="recipe.title"
              class="img-fluid big-img mb-3"
            />
          </div>
          <div class="col-md-6">
            <div class="recipe-info">
              <h3>Recipe Information</h3>
              <ul class="list-unstyled">
                <li><strong>Ready in:</strong> {{ recipe.readyInMinutes }} minutes</li>
                <li><strong>Likes:</strong> {{ recipe.aggregateLikes }}</li>
                <li v-if="recipe.servings"><strong>Servings:</strong> {{ recipe.servings }}</li>
              </ul>
              
              <!-- Diet badges -->
              <div class="diet-badges mb-3">
                <span v-if="recipe.vegan" class="badge bg-success me-2">Vegan 🌱</span>
                <span v-if="recipe.vegetarian" class="badge bg-info me-2">Vegetarian 🥦</span>
                <span v-if="recipe.glutenFree" class="badge bg-warning text-dark me-2">Gluten Free 🚫🌾</span>
              </div>
            </div>
          </div>
        </div>

        <!-- Ingredients Section -->
        <div class="ingredients-section mt-4">
          <h3>Ingredients</h3>
          <ul class="ingredients-list">
            <li v-for="(ingredient, index) in recipe.ingredients" :key="index">
              {{ ingredient.original }}
            </li>
          </ul>
        </div>

        <!-- Instructions Section -->
        <div class="instructions-section mt-4">
          <h3>Instructions</h3>
          <div v-if="recipe._instructions && recipe._instructions.length > 0">
            <ol class="instructions-list">
              <li v-for="instruction in recipe._instructions" :key="instruction.number">
                {{ instruction.step }}
              </li>
            </ol>
          </div>
          <div v-else-if="recipe.analyzedInstructions && recipe.analyzedInstructions.length > 0">
            <ol class="instructions-list">
              <li v-for="instruction in recipe.analyzedInstructions[0].steps" :key="instruction.number">
                {{ instruction.step }}
              </li>
            </ol>
          </div>
          <div v-else-if="recipe.instructions">
            <div class="raw-instructions" v-html="recipe.instructions"></div>
          </div>
          <div v-else>
            <p class="text-muted">No instructions available.</p>
          </div>
        </div>
      </div>
    </div>

    <!-- Loading state -->
    <div v-else class="text-center">
      <div class="spinner-border" role="status">
        <span class="visually-hidden">Loading...</span>
      </div>
      <p class="mt-3">Loading recipe...</p>
    </div>
  </div>
</template>

<script>
import store from '@/store';
import { RecipeAPI } from '@/composables/RecipeAPI';
import { FavoritesAPI } from '@/composables/FavoritesAPI';
import { LikesAPI } from '@/composables/LikesAPI';
import { WatchedAPI } from '@/composables/WatchedAPI';

export default {
  setup() {
    // Initialize composables and destructure their functions
    const { getRecipeInfo } = RecipeAPI();
    const { getFavorites, toggleFavorite, isLoading: favoritesLoading } = FavoritesAPI();
    const { getLiked, toggleLiked, isLoading: likedLoading } = LikesAPI();
    const { addToWatched } = WatchedAPI();

    return {
      getRecipeInfo,
      getFavorites,
      toggleFavorite,
      getLiked,
      toggleLiked,
      addToWatched,
      favoritesLoading,
      likedLoading
    };
  },
  data() {
    return {
      recipe: null,                    // Stores the complete recipe data
      isFavorite: false,               // Tracks if current user has favorited this recipe
      isLiked: false,                  // Tracks if current user has liked this recipe
      showFavoriteTooltip: false,      // Controls favorite button tooltip visibility
      showLikeTooltip: false,          // Controls like button tooltip visibility
      showDebug: false,                // Debug mode toggle (unused)
      store: store                     // Reference to global store
    };
  },
  async created() {
    try {
      // Get recipe ID from route parameters
      const recipeId = this.$route.params.recipeId;
      console.log('RecipeViewPage: Recipe ID from route params:', recipeId);
      
      // Validate recipe ID exists and is valid
      if (!recipeId || recipeId === 'undefined' || recipeId === 'null') {
        console.error('Invalid recipe ID:', recipeId);
        throw new Error('No valid recipe ID provided');
      }

      // Use composable to get recipe data
      const recipeData = await this.getRecipeInfo(recipeId);
      console.log('RecipeViewPage: Received recipe data:', recipeData);
      
      // Destructure recipe data with fallback values
      let {
        analyzedInstructions,
        instructions,
        ingredients,
        aggregateLikes,
        readyInMinutes,
        image,
        title,
        vegan,
        vegetarian,
        glutenFree,
        servings
      } = recipeData;

      // Process instructions - convert string to structured format
      let _instructions = [];
      if (typeof instructions === "string" && instructions.trim() !== "") {
        // Remove HTML tags and split into steps
        const plainInstructions = instructions.replace(/<[^>]+>/g, '');
        _instructions = plainInstructions
          .split(/\n|\.(?!\d)/)
          .map((s, i) => ({ number: i + 1, step: s.trim() }))
          .filter((s) => s.step.length > 0);
      }

      // Process ingredients - handle different formats from API
      let _ingredients = [];
      if (Array.isArray(ingredients)) {
        _ingredients = ingredients.map(ingredient => {
          if (Array.isArray(ingredient)) {
            // Handle ingredients that come as arrays
            return { original: ingredient.filter(Boolean).join(" ") };
          } else if (typeof ingredient === 'string') {
            // Handle ingredients that come as strings
            return { original: ingredient };
          } else if (ingredient && ingredient.original) {
            // Handle ingredients that already have original property
            return ingredient;
          } else {
            // Handle any other format
            return { original: String(ingredient || '') };
          }
        }).filter(ing => ing.original.trim() !== '');
      }

      // Build recipe object with explicit ID and processed data
      this.recipe = {
        id: String(recipeId),
        instructions,
        _instructions,
        analyzedInstructions,
        ingredients: _ingredients,
        aggregateLikes: aggregateLikes || 0,
        readyInMinutes: readyInMinutes || 0,
        image: image || '',
        title: title || 'Recipe',
        vegan: vegan || false,
        vegetarian: vegetarian || false,
        glutenFree: glutenFree || false,
        servings: servings || null
      };

      // Mark as watched and check favorites/likes if user is logged in
      if (store.username) {
        await this.addToWatched(recipeId);
        await this.checkIfFavorite();
        await this.checkIfLiked();
        
        // Clear main page cache when a recipe is watched
        console.log('RecipeViewPage: Invalidating main page cache due to new watched recipe');
        if (store.invalidateMainPageCache) {
          store.invalidateMainPageCache();
        }
      }

    } catch (error) {
      console.error('RecipeViewPage: Error in created():', error);
      // Redirect to 404 page if recipe loading fails
      this.$router.replace("/NotFound");
    }
  },
  methods: {
    async checkIfFavorite() {
      try {
        // Get user's favorite recipe IDs
        const favoriteIds = await this.getFavorites();
        const recipeId = this.$route.params.recipeId;
        // Check if current recipe is in favorites
        this.isFavorite = favoriteIds.includes(String(recipeId));
        console.log('RecipeViewPage: Is favorite check:', this.isFavorite);
      } catch (error) {
        console.error('Error checking if recipe is favorite:', error);
      }
    },

    async checkIfLiked() {
      try {
        // Get user's liked recipe IDs
        const likedIds = await this.getLiked();
        const recipeId = this.$route.params.recipeId;
        // Check if current recipe is liked
        this.isLiked = likedIds.includes(String(recipeId));
        console.log('RecipeViewPage: Is liked check:', this.isLiked);
      } catch (error) {
        console.error('Error checking if recipe is liked:', error);
      }
    },

    async handleToggleFavorite() {
      // Redirect to login if user is not authenticated
      if (!store.username) {
        this.$router.push({ name: 'login' });
        return;
      }

      const recipeId = this.$route.params.recipeId;
      this.showFavoriteTooltip = false;

      try {
        // Toggle favorite status via API
        const success = await this.toggleFavorite(recipeId, this.isFavorite);
        if (success) {
          this.isFavorite = !this.isFavorite;

          // Update the store's favoriteRecipeIds array
          if (this.isFavorite) {
            store.addToFavorites(recipeId);
          } else {
            store.removeFromFavorites(recipeId);
          }
          console.log('RecipeViewPage: Favorite toggled successfully. New state:', this.isFavorite);
        } else {
          console.error('RecipeViewPage: toggleFavorite returned false');
          alert('Failed to update favorites. Please try again.');
        }
      } catch (error) {
        console.error('Error toggling favorite:', error);
        alert('Failed to update favorites. Please try again.');
      }
    },

    async handleToggleLike() {
      // Redirect to login if user is not authenticated
      if (!store.username) {
        this.$router.push({ name: 'login' });
        return;
      }

      const recipeId = this.$route.params.recipeId;
      this.showLikeTooltip = false;

      try {
        // Toggle like status via API
        const success = await this.toggleLiked(recipeId, this.isLiked);
        if (success) {
          this.isLiked = !this.isLiked;

          // Update the store's likedRecipeIds array
        if (this.isLiked) {
          store.addToLiked(recipeId);
          // User just liked the recipe
          this.recipe.aggregateLikes += 1;
        } else {
          store.removeFromLiked(recipeId);
          // User just unliked the recipe
          this.recipe.aggregateLikes -= 1;
          // Prevent negative likes
          if (this.recipe.aggregateLikes < 0) {
            this.recipe.aggregateLikes = 0;
          }
        }
        // Update the search cache if it exists
        this.updateSearchCache(recipeId, this.isLiked);

          console.log('RecipeViewPage: Like toggled successfully. New state:', this.isLiked);
        } else {
          console.error('RecipeViewPage: toggleLiked returned false');
          alert('Failed to update likes. Please try again.');
        }
      } catch (error) {
        console.error('Error toggling like:', error);
        alert('Failed to update likes. Please try again.');
      }
    },

    // Add this new method to update search cache
    updateSearchCache(recipeId, isLiked) {
      // Get cached search results from store
      const cachedSearch = store.getCachedSearchData();
      if (cachedSearch && cachedSearch.results) {
        // Find the recipe in cached results
        const recipe = cachedSearch.results.find(r => r.id == recipeId);
        if (recipe) {
          console.log('RecipeViewPage: Updating search cache for recipe:', recipeId);
          
          // Update the like count in cached search results
          recipe.aggregateLikes = (recipe.aggregateLikes || 0) + (isLiked ? 1 : -1);
          
          // Prevent negative likes
          if (recipe.aggregateLikes < 0) {
            recipe.aggregateLikes = 0;
          }
          
          // Update the cache with modified results
          store.cacheSearchData(cachedSearch.results, cachedSearch.params);
        }
      }
    }
  }
};
</script>

<style scoped>
.card {
  max-width: 1000px;
  margin: auto;
}

.big-img {
  width: 100%;
  height: auto;
  border-radius: 0.5rem;
  box-shadow: 0 4px 8px rgba(0, 0, 0, 0.1);
}

.card-header {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white;
  border-radius: 0.5rem 0.5rem 0 0 !important;
}

.card-title {
  font-size: 1.8rem;
  font-weight: 600;
}

.recipe-info h3 {
  color: #2c3e50;
  margin-bottom: 1rem;
  border-bottom: 2px solid #3498db;
  padding-bottom: 0.5rem;
}

.recipe-info ul li {
  margin-bottom: 0.5rem;
  font-size: 1.1rem;
}

.diet-badges .badge {
  font-size: 0.9rem;
  padding: 0.5rem 0.75rem;
}

.action-buttons {
  position: relative;
}

.btn-like {
  background: transparent;
  border: 2px solid white;
  color: white;
  font-weight: 600;
  padding: 0.5rem 1rem;
  border-radius: 0.5rem;
  transition: all 0.3s ease;
}

.btn-like:hover {
  background: white;
  color: #007bff;
  transform: translateY(-2px);
}

.btn-like.liked {
  background: #007bff;
  border-color: #007bff;
  color: white;
}

.btn-like.liked:hover {
  background: #0056b3;
  border-color: #0056b3;
}

.btn-favorite {
  background: transparent;
  border: 2px solid white;
  color: white;
  font-weight: 600;
  padding: 0.5rem 1rem;
  border-radius: 0.5rem;
  transition: all 0.3s ease;
}

.btn-favorite:hover {
  background: white;
  color: #ffc107;
  transform: translateY(-2px);
}

.btn-favorite.favorited {
  background: #ffc107;
  border-color: #ffc107;
  color: #212529;
}

.btn-favorite.favorited:hover {
  background: #e0a800;
  border-color: #e0a800;
}

.tooltip-custom {
  position: absolute;
  top: 100%;
  background: rgba(0, 0, 0, 0.8);
  color: white;
  padding: 0.5rem;
  border-radius: 0.25rem;
  font-size: 0.8rem;
  white-space: nowrap;
  z-index: 1000;
  margin-top: 0.25rem;
}

.like-tooltip {
  left: 0;
}

.favorite-tooltip {
  right: 0;
}

.ingredients-section h3,
.instructions-section h3 {
  color: #2c3e50;
  margin-bottom: 1rem;
  border-bottom: 2px solid #3498db;
  padding-bottom: 0.5rem;
}

.ingredients-list {
  list-style-type: none;
  padding-left: 0;
}

.ingredients-list li {
  background: #f8f9fa;
  margin-bottom: 0.5rem;
  padding: 0.75rem;
  border-left: 4px solid #3498db;
  border-radius: 0.25rem;
}

.instructions-list {
  counter-reset: step-counter;
}

.instructions-list li {
  margin-bottom: 1rem;
  padding: 1rem;
  background: #f8f9fa;
  border-radius: 0.5rem;
  border-left: 4px solid #27ae60;
  font-size: 1.05rem;
  line-height: 1.6;
}

.raw-instructions {
  background: #f8f9fa;
  padding: 1rem;
  border-radius: 0.5rem;
  border-left: 4px solid #f39c12;
}

.spinner-border {
  color: #3498db;
  width: 3rem;
  height: 3rem;
}

/* Mobile responsiveness */
@media (max-width: 768px) {
  .card-header {
    flex-direction: column;
    align-items: flex-start !important;
    gap: 1rem;
  }
  
  .card-title {
    font-size: 1.4rem;
  }
  
  .action-buttons {
    align-self: stretch;
    justify-content: space-between;
  }
  
  .ingredients-list li,
  .instructions-list li {
    padding: 0.5rem;
    font-size: 0.95rem;
  }
}
</style>