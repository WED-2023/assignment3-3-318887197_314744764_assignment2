import { reactive } from 'vue';

const store = reactive({
  username: null,
  server_domain: "https://localhost:443",
  lastViewedRecipes: [],
  
  // Add caching properties
  mainPageCache: null,
  cacheTimestamp: null,
  cacheExpiration: 30 * 60 * 1000, // 5 minutes in milliseconds

  addLastViewedRecipe(recipe) {
    // Remove if already exists to avoid duplicates
    this.lastViewedRecipes = this.lastViewedRecipes.filter(r => r.id !== recipe.id);
    // Add to beginning
    this.lastViewedRecipes.unshift(recipe);
    // Keep only last 3
    if (this.lastViewedRecipes.length > 3) {
      this.lastViewedRecipes = this.lastViewedRecipes.slice(0, 3);
    }
  },

  // Cache management methods
  getCachedMainPageData() {
    // Check if cache exists and is not expired
    if (this.mainPageCache && this.cacheTimestamp) {
      const now = Date.now();
      const isExpired = (now - this.cacheTimestamp) > this.cacheExpiration;
      
      if (!isExpired) {
        console.log('Store: Returning cached main page data');
        return this.mainPageCache;
      } else {
        console.log('Store: Cache expired, clearing');
        this.clearMainPageCache();
      }
    }
    
    console.log('Store: No valid cache found');
    return null;
  },

  cacheMainPageData(randomRecipes, lastViewedRecipes, blurredRandomRecipes, watchedRecipeIds) {
    console.log('Store: Caching main page data');
    this.mainPageCache = {
      randomRecipes: randomRecipes || [],
      lastViewedRecipes: lastViewedRecipes || [],
      blurredRandomRecipes: blurredRandomRecipes || [],
      watchedRecipeIds: watchedRecipeIds || []
    };
    this.cacheTimestamp = Date.now();
  },

  clearMainPageCache() {
    console.log('Store: Clearing main page cache');
    this.mainPageCache = null;
    this.cacheTimestamp = null;
  },

  invalidateMainPageCache() {
    console.log('Store: Invalidating main page cache (user action)');
    this.clearMainPageCache();
  },

  // Helper method to check if cache is valid
  isCacheValid() {
    if (!this.mainPageCache || !this.cacheTimestamp) {
      return false;
    }
    
    const now = Date.now();
    return (now - this.cacheTimestamp) <= this.cacheExpiration;
  }
});

export default store;