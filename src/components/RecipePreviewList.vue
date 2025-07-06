<template>
  <div class="container">
    <h3 v-if="title">{{ title }}</h3>
    <div v-if="recipes && recipes.length > 0" class="row">
      <div class="col-md-4" v-for="r in recipes" :key="r.id">
        <RecipePreview 
          class="recipePreview" 
          :recipe="r" 
          :isWatched="watchedRecipeIds.includes(r.id)"
          :likedRecipeIds="likedRecipeIds"
          :favoriteRecipeIds="favoriteRecipeIds"
          @favoriteToggled="$emit('favoriteToggled', $event)"
          @likeToggled="$emit('likeToggled', $event)"
        />
      </div>
    </div>
    <div v-else-if="recipes && recipes.length === 0" class="text-center">
      <p>No recipes to display.</p>
    </div>
    <div v-else class="text-center">
      <p>Loading recipes...</p>
    </div>
  </div>
</template>

<script>
import RecipePreview from "./RecipePreview.vue";

export default {
  name: "RecipePreviewList",

  // Child components used in this component
  components: { 
    RecipePreview 
  },

  // Props definition - data passed down from parent components
  props: {
    // Optional title to display above the recipe list
    title: {
      type: String,
      default: ""
    },
    // Array of recipe objects to display in the list
    recipes: {
      type: Array,
      default: () => []
    },
    // Array of recipe IDs that the user has already viewed
    watchedRecipeIds: {
      type: Array,
      default: () => []
    },
    // Array of recipe IDs that the user has liked
    likedRecipeIds: {
      type: Array,
      default: () => []
    },
    // Array of recipe IDs that the user has marked as favorites
    favoriteRecipeIds: { 
      type: Array,
      default: () => []
    }
  },
  
  // Events that this component can emit to parent components
  // These are passed up from child RecipePreview components
  emits: ['favoriteToggled', 'likeToggled']
};
</script>

<style scoped>
.container {
  min-height: 400px;
}

.recipePreview {
  margin-bottom: 1.5rem;
}
</style>