<template>
  <div class="card h-100">
    <router-link
      :to="{ name: 'recipe', params: { recipeId: recipe.id } }"
      class="image-link"
      title="Click to view recipe"
    >
      <img
        v-if="recipe.image"
        :src="recipe.image"
        class="card-img-top recipe-image"
        alt="Recipe image"
      />
      <div class="image-overlay">View Recipe</div>
    </router-link>
    <div class="card-body text-center">
      <h5 class="card-title">{{ recipe.title }}</h5>
      <div class="mb-2">
        <span v-if="recipe.vegan" class="badge bg-success me-1">Vegan 🌱</span>
        <span v-if="recipe.vegetarian" class="badge bg-info text-dark me-1">Vegetarian 🥦</span>
        <span v-if="recipe.glutenFree" class="badge bg-warning text-dark">Gluten Free 🚫🌾</span>
      </div>
      <p class="card-text">{{ recipe.readyInMinutes }} minutes</p>
      <p class="card-text">{{ recipe.aggregateLikes }} likes</p>
    </div>
  </div>
</template>

<script>
export default {
  name: "RecipePreview",
  props: {
    recipe: {
      type: Object,
      required: true
    }
  }
}
</script>

<style scoped>
.recipe-image {
  width: 100%;
  height: 200px;
  object-fit: cover;
  transition: transform 0.2s, box-shadow 0.2s;
  cursor: pointer;
  display: block;
}
.image-link {
  position: relative;
  display: block;
}
.image-overlay {
  position: absolute;
  bottom: 10px;
  left: 50%;
  transform: translateX(-50%);
  background: rgba(0,0,0,0.6);
  color: #fff;
  padding: 4px 12px;
  border-radius: 8px;
  opacity: 0;
  transition: opacity 0.2s;
  pointer-events: none;
  font-size: 1rem;
  letter-spacing: 0.5px;
}
.image-link:hover .recipe-image {
  transform: scale(1.07);
  box-shadow: 0 4px 20px rgba(0,0,0,0.2);
}
.image-link:hover .image-overlay {
  opacity: 1;
}
</style>