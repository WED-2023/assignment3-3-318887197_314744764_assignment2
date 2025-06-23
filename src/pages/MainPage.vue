<template>
  <div class="container">
    <!-- Always show 3 random recipes -->
    <RecipePreviewList title="Random Recipes" class="RandomRecipes center" />

    <!-- Show last viewed recipes for logged-in users -->
    <div v-if="store.username && store.lastViewedRecipes.length">
      <h3>Last Viewed Recipes</h3>
      <div class="row">
        <div class="col" v-for="r in store.lastViewedRecipes" :key="r.id">
          <RecipePreview class="recipePreview" :recipe="r" />
        </div>
      </div>
    </div>

    <!-- Show blurred random recipes for guests -->
    <div v-else>
      <div class="text-center mt-4 mb-1">
        <router-link :to="{ name: 'login' }" class="btn btn-success px-4">
          You need to be logged in to see this
        </router-link>
      </div>
      <RecipePreviewList
        title="Last Viewed Recipes"
        class="RandomRecipes blur center"
      />
    </div>
  </div>
</template>

<script>
import store from '@/store';
import RecipePreviewList from "../components/RecipePreviewList.vue";
import RecipePreview from "../components/RecipePreview.vue";

export default {
  components: {
    RecipePreviewList,
    RecipePreview,
  },
  setup() {
    return { store };
  }
};
</script>

<style lang="scss" scoped>
.RandomRecipes {
  margin: 10px 0 10px;
}
.blur {
  -webkit-filter: blur(5px); 
  filter: blur(2px);
}
:deep(.blur .recipe-preview){
  pointer-events: none;
  cursor: default;
}
.text-center.mb-2.mb-1 {
  margin-bottom: 0.05rem !important;
}
</style>
