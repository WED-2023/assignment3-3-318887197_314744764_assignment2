import { reactive } from 'vue';

const store = reactive({
  username: null,
  server_domain: "https://localhost:443",
  lastViewedRecipes: [],
  
  // Add user interaction tracking
  favoriteRecipeIds: [],
  likedRecipeIds: [],
  watchedRecipeIds: [],
  
  // Add caching properties
  mainPageCache: null,
  cacheTimestamp: null,
  cacheExpiration: 5 * 60 * 1000, // 5 minutes in milliseconds
  searchCache: null,
  searchCacheTimestamp: null,
  searchCacheParams: null,

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

  // User interaction methods
  addToFavorites(recipeId) {
    if (!this.favoriteRecipeIds.includes(recipeId)) {
      this.favoriteRecipeIds.push(recipeId);
      console.log('Store: Added to favorites:', recipeId);
    }
  },

  removeFromFavorites(recipeId) {
    this.favoriteRecipeIds = this.favoriteRecipeIds.filter(id => id !== recipeId);
    console.log('Store: Removed from favorites:', recipeId);
  },

  addToLiked(recipeId) {
    if (!this.likedRecipeIds.includes(recipeId)) {
      this.likedRecipeIds.push(recipeId);
      console.log('Store: Added to liked:', recipeId);
    }
  },

  removeFromLiked(recipeId) {
    this.likedRecipeIds = this.likedRecipeIds.filter(id => id !== recipeId);
    console.log('Store: Removed from liked:', recipeId);
  },

  // Keep only ONE toggleLike method
  toggleLike(recipeId) {
    const index = this.likedRecipeIds.indexOf(recipeId);
    if (index > -1) {
      this.likedRecipeIds.splice(index, 1);
      console.log('Store: Unliked recipe:', recipeId);
      return false; // unliked
    } else {
      this.likedRecipeIds.push(recipeId);
      console.log('Store: Liked recipe:', recipeId);
      return true; // liked
    }
  },

  addToWatched(recipeId) {
    if (!this.watchedRecipeIds.includes(recipeId)) {
      this.watchedRecipeIds.push(recipeId);
      console.log('Store: Added to watched:', recipeId);
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
  },

  getCachedSearchData() {
    if (this.searchCache && this.searchCacheTimestamp) {
      console.log('Store: Returning cached search data');
      return {
        results: this.searchCache,
        params: this.searchCacheParams,
        timestamp: this.searchCacheTimestamp
      };
    }
    
    console.log('Store: No valid search cache found');
    return null;
  },

  cacheSearchData(searchResults, searchParams) {
    console.log('Store: Caching search data');
    this.searchCache = searchResults || [];
    this.searchCacheParams = searchParams || {};
    this.searchCacheTimestamp = Date.now();
  },

  clearSearchCache() {
    console.log('Store: Clearing search cache');
    this.searchCache = null;
    this.searchCacheTimestamp = null;
    this.searchCacheParams = null;
  },

  invalidateSearchCache() {
    console.log('Store: Invalidating search cache (user action)');
    this.clearSearchCache();
  },

  // Add a method to initialize user data
  initializeUserData(favoriteIds = [], likedIds = [], watchedIds = []) {
    console.log('Store: Initializing user data');
    this.favoriteRecipeIds = favoriteIds.map(id => String(id));
    this.likedRecipeIds = likedIds.map(id => String(id));
    this.watchedRecipeIds = watchedIds.map(id => String(id));
  },

  logout() {
    console.log('Store: User logging out, clearing all data');
    this.username = null;
    this.lastViewedRecipes = [];
    this.favoriteRecipeIds = [];
    this.likedRecipeIds = [];
    this.watchedRecipeIds = [];
    this.clearMainPageCache();
    this.clearSearchCache();
  },
});

export default store;