import axios from 'axios';
import { reactive } from 'vue';

const store = reactive({
  username: null,
  // TODO: change back to lenis.cs.bgu.ac.il
  // server_domain: "https://lenis.cs.bgu.ac.il",
  server_domain: "https://localhost:443",
  lastViewedRecipes: [],

  async checkAuth() {
    try {
      const response = await axios.get(this.server_domain + '/me', { withCredentials: true });
      this.username = response.data.username;
    } catch {
      this.username = null;
    }
  },

  login(username) {
    this.username = username;
  },

  logout() {
    this.username = undefined;
  },

   // Add this method to track last viewed recipes
  addLastViewedRecipe(recipe) {
    this.lastViewedRecipes = this.lastViewedRecipes.filter(r => r.id !== recipe.id);
    this.lastViewedRecipes.unshift(recipe);
    if (this.lastViewedRecipes.length > 3) {
      this.lastViewedRecipes = this.lastViewedRecipes.slice(0, 3);
    }
  }
});

export default store;