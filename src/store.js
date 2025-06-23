import axios from 'axios';
import { reactive } from 'vue';

const state = reactive({
  username: null,
  server_domain: "https://lenis.cs.bgu.ac.il",
  lastViewedRecipes: [],
});

const store = {
  ...state,
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
    console.log("login", this.username);
  },

  logout() {
    this.username = undefined;
    console.log("logout");
  },

   // Add this method to track last viewed recipes
  addLastViewedRecipe(recipe) {
    this.lastViewedRecipes = this.lastViewedRecipes.filter(r => r.id !== recipe.id);
    this.lastViewedRecipes.unshift(recipe);
    if (this.lastViewedRecipes.length > 3) {
      this.lastViewedRecipes = this.lastViewedRecipes.slice(0, 3);
    }
  }
};

export default store;
