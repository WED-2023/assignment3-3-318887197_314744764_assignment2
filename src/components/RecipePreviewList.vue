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
  components: { 
    RecipePreview 
  },
  props: {
    title: {
      type: String,
      default: ""
    },
    recipes: {
      type: Array,
      default: () => []
    },
    watchedRecipeIds: {
      type: Array,
      default: () => []
    },
    likedRecipeIds: {
      type: Array,
      default: () => []
    }
  }
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