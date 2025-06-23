<template>
  <div class="container">
    <div v-if="!isReady" class="text-center">
      <p>Loading...</p>
    </div>
    
    <div v-else>
      <!-- Always show 3 random recipes (clear and clickable for everyone) -->
      <RecipePreviewList 
        title="Random Recipes" 
        class="RandomRecipes center"
      />

      <!-- Show content based on user login status -->
      <div v-if="username">
        <!-- User is logged in -->
        <div>
          <h3>Your Personalized Recipes</h3>
          <!-- Personalized content will go here -->
        </div>
      </div>
      
      <div v-else>
        <!-- User is NOT logged in - show blurred recipes -->
        <div class="text-center mt-4 mb-1">
          <router-link :to="{ name: 'login' }" class="btn btn-success px-4">
            You need to be logged in to see this
          </router-link>
        </div>
        <RecipePreviewList
          title="Personalized Recipes"
          class="RandomRecipes blur center"
        />
      </div>

      <!-- Show last viewed recipes for logged-in users (if any) -->
      <div v-if="username && store.lastViewedRecipes.length">
        <h3>Last Viewed Recipes</h3>
        <div class="row">
          <div class="col" v-for="r in store.lastViewedRecipes" :key="r.id">
            <RecipePreview class="recipePreview" :recipe="r" />
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import store from '@/store';
import RecipePreviewList from "../components/RecipePreviewList.vue";
import RecipePreview from "../components/RecipePreview.vue";
import { computed, ref, onMounted } from 'vue';

export default {
  components: {
    RecipePreviewList,
    RecipePreview,
  },
  setup() {
    const username = computed(() => store.username);
    const isReady = ref(false);
    
    onMounted(() => {
      // Small delay to ensure the auth check from main.js has completed
      setTimeout(() => {
        isReady.value = true;
      }, 100);
    });
    
    // TODO: Add logic here for logged-in users
    // When store.username is defined, make GET request to server
    
    return { store, username, isReady };
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
  pointer-events: none;
  cursor: default;
}

:deep(.blur) {
  pointer-events: none !important;
  cursor: default !important;
}

:deep(.blur *) {
  pointer-events: none !important;
  cursor: default !important;
}

:deep(.blur a) {
  pointer-events: none !important;
  cursor: default !important;
  text-decoration: none !important;
}

.text-center.mb-2.mb-1 {
  margin-bottom: 0.05rem !important;
}
</style>