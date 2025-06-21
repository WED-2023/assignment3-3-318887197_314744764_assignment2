<template>
  <div class="container my-5">
    <div v-if="recipe" class="card shadow-lg">
      <div class="card-header text-center bg-primary text-white">
        <h1 class="mb-0 display-4">{{ recipe.title }}</h1>
      </div>
      <img
        :src="recipe.image"
        class="card-img-top mx-auto d-block my-4 rounded big-img"
        alt="Recipe image"
      />
      <div class="card-body fs-5">
        <div class="row mb-4">
          <div class="col-md-6 mb-3 mb-md-0">
            <div class="h4 mb-3">Ingredients</div>
            <ul class="list-group list-group-flush">
              <li
                v-for="(r, index) in recipe.ingredients"
                :key="index"
                class="list-group-item fs-5"
              >
                {{ r.original }}
              </li>
            </ul>
          </div>
          <div class="col-md-6">
            <div class="h4 mb-3">Instructions</div>
            <ol class="list-group list-group-numbered">
              <li v-for="s in recipe._instructions" :key="s.number" class="list-group-item fs-5">
                {{ s.step }}
              </li>
            </ol>
          </div>
        </div>
        <div class="d-flex justify-content-between align-items-center mt-4">
          <span class="badge bg-info text-dark fs-4 px-3 py-2">Ready in {{ recipe.readyInMinutes }} minutes</span>
          <span class="badge bg-success fs-4 px-3 py-2">Likes: {{ recipe.aggregateLikes }}</span>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
export default {
  data() {
    return {
      recipe: null
    };
  },
  async created() {
    try {
      let response;
      try {
        response = await this.axios.get(
          this.$root.store.server_domain + "/recipes/info",
          {
            params: { recipeId: this.$route.params.recipeId }
          }
        );
        if (response.status !== 200) this.$router.replace("/NotFound");
      } catch (error) {
        console.log("error.response.status", error.response.status);
        this.$router.replace("/NotFound");
        return;
      }

      let {
        analyzedInstructions,
        instructions,
        ingredients,
        aggregateLikes,
        readyInMinutes,
        image,
        title
      } = response.data;

      // instructions is a string, split it into steps
      let _instructions = [];
      if (typeof instructions === "string" && instructions.trim() !== "") {
        const plainInstructions = instructions.replace(/<[^>]+>/g, ''); // remove HTML tags
        _instructions = plainInstructions
          .split(/\n|\.(?!\d)/) // split by newlines or periods not followed by a digit
          .map((s, i) => ({ number: i + 1, step: s.trim() }))
          .filter((s) => s.step.length > 0);
      }

      // Map ingredients array-of-arrays to objects with an 'original' property
      let _ingredients = Array.isArray(ingredients)
        ? ingredients.map(arr => ({
            original: arr.filter(Boolean).join(" ")
          }))
        : [];

      let _recipe = {
        instructions,
        _instructions,
        analyzedInstructions,
        ingredients: _ingredients,
        aggregateLikes,
        readyInMinutes,
        image,
        title
      };

      this.recipe = _recipe;
    } catch (error) {
      console.log(error);
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
  max-width: 420px;
  max-height: 300px;
  width: 100%;
  object-fit: cover;
  border: 4px solid #e3e3e3;
  box-shadow: 0 4px 24px rgba(0,0,0,0.10);
}
.card-header {
  padding-top: 2rem;
  padding-bottom: 2rem;
}
.card-body {
  font-size: 1.08rem;
  line-height: 1.6;
}
.h4, .h5 {
  font-weight: 600;
}
.list-group-item {
  font-size: 1.15rem;
  background: #f8f9fa;
  border: none;
  margin-bottom: 0.25rem;
}
@media (max-width: 767px) {
  .big-img {
    max-width: 100%;
    max-height: 180px;
  }
  .card {
    max-width: 100%;
  }
}
</style>