<template>
  <div id="app">
    <!-- New Responsive Navbar -->
    <nav class="custom-navbar">
      <div class="navbar-container">
        <!-- Left Side -->
        <div class="navbar-left">
          <!-- Logo -->
          <div class="navbar-logo">
            <a href="#" @click.prevent class="logo-link">Recipe World</a>
          </div>
          
          <!-- Menu Items - Always visible -->
          <div class="navbar-menu">
            <router-link :to="{ name: 'main' }" class="nav-item">Main</router-link>
            <router-link :to="{ name: 'about' }" class="nav-item">About</router-link>
            <router-link :to="{ name: 'search' }" class="nav-item">Search</router-link>
          </div>
          
          <!-- Create Recipe Button - Only for logged in users -->
          <div v-if="username" class="create-recipe-section">
            <button @click="openCreateRecipeModal" class="create-recipe-btn">
              <i class="fas fa-plus"></i>
              <span class="create-text">Create Recipe</span>
            </button>
          </div>
          
          <!-- Personal Section - Only for logged in users -->
          <div v-if="username" class="personal-section">
            <div 
              class="dropdown" 
              @mouseenter="handlePersonalHover(true)" 
              @mouseleave="handlePersonalHover(false)"
            >
              <button 
                class="nav-item dropdown-toggle" 
                @click="togglePersonalDropdown"
              >
                Personal
                <svg class="dropdown-arrow" :class="{ 'rotate': showPersonalDropdown }" width="12" height="8" viewBox="0 0 12 8" fill="none">
                  <path d="M1 1L6 6L11 1" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
                </svg>
              </button>
              <div 
                :class="['dropdown-menu', { 'dropdown-menu-visible': showPersonalDropdown }]"
                @mouseenter="handlePersonalHover(true)"
                @mouseleave="handlePersonalHover(false)"
              >
                <router-link :to="{ name: 'favorites' }" class="dropdown-item">Favorites ⭐</router-link>
                <router-link :to="{ name: 'personal' }" class="dropdown-item">My Recipes</router-link>
                <router-link :to="{ name: 'familia' }" class="dropdown-item">La Familia 👨‍👩‍👧‍👦</router-link>
              </div>
            </div>
          </div>
        </div>

        <!-- Right Side - USER CONTROLS AND GREETING -->
        <div class="navbar-right">
          <!-- Greeting Section: show only for guests -->
          <div class="greeting-section" v-if="!username">
            <span class="greeting-text">
              Hello Guest
            </span>
          </div>
          
          <!-- User Section -->
          <div v-if="username" class="user-section">
            <div 
              class="dropdown" 
              @mouseenter="handleUserHover(true)" 
              @mouseleave="handleUserHover(false)"
            >
              <button 
                class="user-dropdown-toggle" 
                @click="toggleUserDropdown"
              >
                {{ username }}
                <svg class="dropdown-arrow" :class="{ 'rotate': showUserDropdown }" width="12" height="8" viewBox="0 0 12 8" fill="none">
                  <path d="M1 1L6 6L11 1" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
                </svg>
              </button>
              <div 
                :class="['dropdown-menu', 'dropdown-menu-right', { 'dropdown-menu-visible': showUserDropdown }]"
                @mouseenter="handleUserHover(true)"
                @mouseleave="handleUserHover(false)"
              >
                <a href="#" @click.prevent class="dropdown-item disabled">Profile</a>
                <button @click="logout" class="dropdown-item logout-btn">Sign Out</button>
              </div>
            </div>
          </div>
          
          <!-- Guest Section -->
          <div v-else class="guest-section">
            <router-link :to="{ name: 'login' }" class="auth-link">Login</router-link>
            <router-link :to="{ name: 'register' }" class="auth-link">Register</router-link>
          </div>
        </div>
      </div>
    </nav>
    
    <!-- Toast Container - MOVED OUTSIDE NAVBAR -->
    <div 
      v-if="showToast" 
      class="toast-container"
      :class="{ 'show': showToast }"
    >
      <div 
        class="toast"
        :class="{
          'toast-success': toastType === 'success',
          'toast-error': toastType === 'error'
        }"
      >
        <div class="toast-content">
          <i 
            class="fas"
            :class="{
              'fa-check-circle': toastType === 'success',
              'fa-exclamation-circle': toastType === 'error'
            }"
          ></i>
          <span class="toast-message">{{ toastMessage }}</span>
        </div>
        <button @click="hideToast" class="toast-close">
          <i class="fas fa-times"></i>
        </button>
      </div>
    </div>
    
    <!-- Global Create Recipe Modal -->
    <div v-if="showCreateRecipeModal" class="modal-overlay" @click="closeCreateRecipeModal">
      <div class="modal-container" @click.stop>
        <div class="modal-header">
          <h3 class="modal-title">
            <i class="fas fa-plus-circle text-primary me-2"></i>
            Create New Recipe
          </h3>
          <button @click="closeCreateRecipeModal" class="modal-close-btn">
            <i class="fas fa-times"></i>
          </button>
        </div>
        <div class="modal-body">
          <CreateRecipeForm 
            :recipe="newRecipe" 
            :showValidation="showValidation"
            @updateRecipe="updateRecipe"
            @submit="handleCreateRecipe"
          />
        </div>
        <div class="modal-footer">
          <button @click="closeCreateRecipeModal" class="btn btn-secondary">
            Cancel
          </button>
          <button @click="handleCreateRecipe" class="btn btn-primary" :disabled="isCreating">
            <span v-if="isCreating" class="spinner-border spinner-border-sm me-2"></span>
            {{ isCreating ? 'Creating...' : 'Create Recipe' }}
          </button>
        </div>
      </div>
    </div>
    
    <router-view />
  </div>
</template>

<script setup>
import store from '@/store';
import { computed, ref, onMounted, onUnmounted } from 'vue';
import axios from 'axios';
import { useRouter } from 'vue-router';
import CreateRecipeForm from '@/components/CreateRecipeForm.vue';
import { MyRecipesAPI } from '@/composables/MyRecipesAPI'; // Use your existing composable

const router = useRouter();

// Use composables
const { addMyRecipe, isLoading: isCreating } = MyRecipesAPI();

// Reactive state
const showPersonalDropdown = ref(false);
const showUserDropdown = ref(false);
const personalClickedOpen = ref(false);
const userClickedOpen = ref(false);

// Create Recipe Modal state
const showCreateRecipeModal = ref(false);
const showValidation = ref(false);

// Toast state
const showToast = ref(false);
const toastMessage = ref('');
const toastType = ref('success'); // 'success' or 'error'

// New recipe template
const createEmptyRecipe = () => ({
  title: '',
  image: '',
  readyInMinutes: null,
  servings: null,
  vegetarian: false,
  vegan: false,
  glutenFree: false,
  ingredients: [['', '', '']],
  instructions: '',
  isFamilyRecipe: false,
  family_creator: '',
  family_occasion: '',
  family_pictures: ['']
});

const newRecipe = ref(createEmptyRecipe());

// Computed
const username = computed(() => store.username);

// Toast methods
const showSuccessToast = () => {
  toastMessage.value = 'Recipe created successfully!';
  toastType.value = 'success';
  showToast.value = true;
  
  // Auto-hide after 3 seconds
  setTimeout(() => {
    showToast.value = false;
  }, 3000);
};

const showErrorToast = (message) => {
  toastMessage.value = message;
  toastType.value = 'error';
  showToast.value = true;
  
  // Auto-hide after 4 seconds
  setTimeout(() => {
    showToast.value = false;
  }, 4000);
};

const hideToast = () => {
  showToast.value = false;
};

// Create Recipe Modal Methods
const openCreateRecipeModal = () => {
  newRecipe.value = createEmptyRecipe();
  showValidation.value = false;
  showCreateRecipeModal.value = true;
  document.body.style.overflow = 'hidden'; // Prevent background scrolling
};

const closeCreateRecipeModal = () => {
  showCreateRecipeModal.value = false;
  showValidation.value = false;
  newRecipe.value = createEmptyRecipe();
  document.body.style.overflow = 'auto'; // Restore scrolling
};

const updateRecipe = (updatedRecipe) => {
  newRecipe.value = updatedRecipe;
};

const handleCreateRecipe = async () => {
  showValidation.value = true;
  
  // Validate form
  const isValid = validateRecipe(newRecipe.value);
  if (!isValid) {
    console.log('Form validation failed');
    return;
  }

  try {
    console.log('Creating recipe - Raw data:', newRecipe.value);
    console.log('isFamilyRecipe value:', newRecipe.value.isFamilyRecipe);

    // Process the recipe data EXACTLY like PersonalPage.vue and FamiliaPage.vue
    const processedRecipeData = {
      title: newRecipe.value.title.trim(),
      readyInMinutes: newRecipe.value.readyInMinutes,
      servings: newRecipe.value.servings,
      glutenFree: newRecipe.value.glutenFree,
      vegan: newRecipe.value.vegan,
      vegetarian: newRecipe.value.vegetarian,
      ingredients: newRecipe.value.ingredients
        .filter(ing => 
          ing[0] && ing[0].trim() !== '' && 
          ing[1] && ing[1] > 0 && 
          ing[2] && ing[2].trim() !== ''
        )
        .map(ing => [
          ing[0].trim(),
          ing[1],
          ing[2].trim()
        ]),
      instructions: newRecipe.value.instructions.trim(),
      image: newRecipe.value.image.trim(),
      isFamilyRecipe: newRecipe.value.isFamilyRecipe, // This should preserve the boolean
      family_creator: newRecipe.value.family_creator?.trim() || null,
      family_occasion: newRecipe.value.family_occasion?.trim() || null,
      family_pictures: (newRecipe.value.family_pictures || []).filter(pic => pic.trim() !== '') || null
    };

    console.log('Processed recipe data:', processedRecipeData);
    console.log('Processed isFamilyRecipe value:', processedRecipeData.isFamilyRecipe);

    // Use the processed data instead of raw newRecipe.value
    const recipeId = await addMyRecipe(processedRecipeData);
    
    console.log('Recipe created successfully with ID:', recipeId);
    closeCreateRecipeModal();
    
    // Show success toast
    showSuccessToast();
    
    // Use the processed data for routing decision
    console.log('Redirecting based on recipe type:', processedRecipeData.isFamilyRecipe);
    if (processedRecipeData.isFamilyRecipe) {
      router.push({ name: 'familia' });
    } else {
      router.push({ name: 'personal' });
    }
    
  } catch (error) {
    console.error('Error creating recipe:', error);
    showErrorToast('Failed to create recipe. Please try again.');
  }
};

// Recipe validation
const validateRecipe = (recipe) => {
  const isValidUrl = (string) => {
    try {
      new URL(string);
      return true;
    } catch (_) {
      return false;
    }
  };

  const checks = {
    title: recipe.title && recipe.title.trim() !== '',
    readyInMinutes: recipe.readyInMinutes && recipe.readyInMinutes > 0,
    servings: recipe.servings && recipe.servings > 0,
    ingredients: recipe.ingredients && recipe.ingredients.every(ing => 
      ing && ing[0] && ing[0].trim() !== '' && 
      ing[1] && ing[1] > 0 && 
      ing[2] && ing[2].trim() !== ''
    ),
    instructions: recipe.instructions && recipe.instructions.trim() !== '',
    image: recipe.image && recipe.image.trim() !== '' && isValidUrl(recipe.image),
    family_creator: !recipe.isFamilyRecipe || (recipe.family_creator && recipe.family_creator.trim() !== ''),
    family_occasion: !recipe.isFamilyRecipe || (recipe.family_occasion && recipe.family_occasion.trim() !== '')
  };

  return Object.values(checks).every(check => check);
};

// Listen for global events to open modal
const handleGlobalCreateRecipe = () => {
  openCreateRecipeModal();
};

const logout = async () => {
  try {
    await axios.post(store.server_domain + '/Logout', {}, { withCredentials: true });
    store.logout();
    router.push({ name: 'main' });
  } catch (err) {
    store.logout();
    router.push({ name: 'main' });
  }
};

// Personal dropdown handlers
const handlePersonalHover = (isHovering) => {
  if (personalClickedOpen.value) {
    return;
  } else {
    showPersonalDropdown.value = isHovering;
  }
};

const togglePersonalDropdown = () => {
  if (personalClickedOpen.value) {
    personalClickedOpen.value = false;
    showPersonalDropdown.value = false;
  } else {
    personalClickedOpen.value = true;
    showPersonalDropdown.value = true;
    
    userClickedOpen.value = false;
    showUserDropdown.value = false;
  }
};

// User dropdown handlers
const handleUserHover = (isHovering) => {
  if (userClickedOpen.value) {
    return;
  } else {
    showUserDropdown.value = isHovering;
  }
};

const toggleUserDropdown = () => {
  if (userClickedOpen.value) {
    userClickedOpen.value = false;
    showUserDropdown.value = false;
  } else {
    userClickedOpen.value = true;
    showUserDropdown.value = true;
    
    personalClickedOpen.value = false;
    showPersonalDropdown.value = false;
  }
};

const closeDropdowns = (event) => {
  if (!event.target.closest('.dropdown')) {
    personalClickedOpen.value = false;
    userClickedOpen.value = false;
    showPersonalDropdown.value = false;
    showUserDropdown.value = false;
  }
};

// Handle escape key
const handleEscape = (event) => {
  if (event.key === 'Escape' && showCreateRecipeModal.value) {
    closeCreateRecipeModal();
  }
};

// Lifecycle
onMounted(() => {
  document.addEventListener('click', closeDropdowns);
  document.addEventListener('keydown', handleEscape);
  window.addEventListener('open-create-recipe-modal', handleGlobalCreateRecipe);
});

onUnmounted(() => {
  document.removeEventListener('click', closeDropdowns);
  document.removeEventListener('keydown', handleEscape);
  document.body.style.overflow = 'auto'; // Ensure scrolling is restored
  window.removeEventListener('open-create-recipe-modal', handleGlobalCreateRecipe);
});
</script>

<style lang="scss">
@import "@/scss/form-style.scss";

#app {
  font-family: Avenir, Helvetica, Arial, sans-serif;
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
  color: #2c3e50;
  min-height: 100vh;
}

// Navbar styles
.custom-navbar {
  background: #14b8a6;
  height: 50px;
  width: 100%;
  position: sticky;
  top: 0;
  z-index: 1000;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
}

.navbar-container {
  display: flex;
  align-items: center;
  height: 100%;
  width: 100%;
  margin: 0;
  padding: 0;
}

.navbar-left {
  display: flex;
  align-items: center;
  gap: 2rem;
  padding-left: 1rem;
}

.navbar-right {
  display: flex;
  align-items: center;
  gap: 1rem;
  margin-left: auto;
  padding-right: 1rem;
}

// Create Recipe Button Styles
.create-recipe-section {
  display: flex;
  align-items: center;
}

.create-recipe-btn {
  background: #059669;
  border: none;
  color: white;
  font-weight: 600;
  padding: 0.5rem 1rem;
  border-radius: 0.375rem;
  cursor: pointer;
  font-size: 0.875rem;
  display: flex;
  align-items: center;
  gap: 0.5rem;
  transition: all 0.2s ease;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);

  &:hover {
    background: #047857;
    transform: translateY(-1px);
    box-shadow: 0 2px 4px rgba(0, 0, 0, 0.15);
  }

  &:active {
    transform: translateY(0);
  }

  i {
    font-size: 0.75rem;
  }
}

// Toast styles - POSITIONED OUTSIDE NAVBAR
.toast-container {
  position: fixed;
  top: 70px; // Below navbar
  right: 20px;
  z-index: 9999;
  opacity: 0;
  transform: translateX(100%);
  transition: all 0.3s ease-in-out;
}

.toast-container.show {
  opacity: 1;
  transform: translateX(0);
}

.toast {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 12px 16px;
  border-radius: 8px;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
  min-width: 300px;
  max-width: 400px;
  font-size: 14px;
  font-weight: 500;
}

.toast-success {
  background-color: #d1edff;
  color: #0a58ca;
  border-left: 4px solid #0d6efd;
}

.toast-error {
  background-color: #f8d7da;
  color: #721c24;
  border-left: 4px solid #dc3545;
}

.toast-content {
  display: flex;
  align-items: center;
  gap: 8px;
  flex: 1;
}

.toast-content i {
  font-size: 16px;
}

.toast-message {
  flex: 1;
}

.toast-close {
  background: none;
  border: none;
  color: inherit;
  cursor: pointer;
  padding: 4px;
  border-radius: 4px;
  opacity: 0.7;
  transition: opacity 0.2s;
}

.toast-close:hover {
  opacity: 1;
}

// Modal Styles
.modal-overlay {
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background: rgba(0, 0, 0, 0.5);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1050;
  padding: 1rem;
}

.modal-container {
  background: white;
  border-radius: 0.5rem;
  box-shadow: 0 10px 25px rgba(0, 0, 0, 0.2);
  max-height: 90vh;
  overflow-y: auto;
  width: 100%;
  max-width: 1000px; // Increased from default
  margin: 0 auto;
}

.modal-header {
  padding: 1.5rem 1.5rem 0 1.5rem;
  display: flex;
  justify-content: space-between;
  align-items: center;
  border-bottom: 1px solid #dee2e6;
  padding-bottom: 1rem;
  margin-bottom: 0;
}

.modal-title {
  margin: 0;
  font-size: 1.25rem;
  font-weight: 600;
}

.modal-close-btn {
  background: none;
  border: none;
  font-size: 1.5rem;
  color: #6c757d;
  cursor: pointer;
  padding: 0;
  width: 2rem;
  height: 2rem;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 0.25rem;
  
  &:hover {
    background-color: #f8f9fa;
    color: #000;
  }
}

.modal-body {
  padding: 1.5rem;
  max-height: calc(90vh - 140px);
  overflow-y: auto;
}

.modal-footer {
  padding: 1rem 1.5rem;
  border-top: 1px solid #dee2e6;
  display: flex;
  justify-content: flex-end;
  gap: 0.5rem;
}

// Logo and nav styles
.navbar-logo {
  .logo-link {
    font-size: 1.25rem !important;
    font-weight: bold !important;
    color: white !important;
    text-decoration: none !important;
    cursor: default !important;
    
    &:hover {
      color: white !important;
    }
  }
}

.navbar-menu {
  display: flex !important;
  align-items: center !important;
  gap: 1.5rem !important;
}

.personal-section {
  display: flex !important;
  align-items: center !important;
}

.nav-item {
  color: white !important;
  text-decoration: none !important;
  font-weight: 500 !important;
  padding: 0.5rem 0 !important;
  transition: color 0.2s ease !important;
  background: none !important;
  border: none !important;
  cursor: pointer !important;
  font-size: 0.875rem !important;
  display: flex !important;
  align-items: center !important;
  gap: 0.25rem !important;
  
  &:hover:not(.disabled) {
    color: #f0f9ff !important;
  }
  
  &.router-link-active {
    color: #f0f9ff !important;
    border-bottom: 2px solid white !important;
  }
  
  &.disabled {
    opacity: 0.6 !important;
    cursor: not-allowed !important;
    
    &:hover {
      color: white !important;
    }
  }
}

.user-section, .guest-section {
  display: flex !important;
  align-items: center !important;
  gap: 0.5rem !important;
}

.user-dropdown-toggle {
  background: none !important;
  border: none !important;
  color: white !important;
  font-weight: 500 !important;
  cursor: pointer !important;
  padding: 0.5rem !important;
  border-radius: 0.25rem !important;
  transition: background-color 0.2s ease !important;
  display: flex !important;
  align-items: center !important;
  gap: 0.25rem !important;
  
  &:hover {
    background: rgba(255, 255, 255, 0.1) !important;
  }
}

.auth-link {
  color: white !important;
  text-decoration: none !important;
  font-weight: 500 !important;
  padding: 0.5rem !important;
  border-radius: 0.25rem !important;
  transition: background-color 0.2s ease !important;
  
  &:hover {
    background: rgba(255, 255, 255, 0.1) !important;
  }
}

// Dropdown Styles
.dropdown {
  position: relative;
  z-index: 1001;
}

.dropdown-toggle {
  background: none;
  border: none;
  color: white;
  font-weight: 500;
  cursor: pointer;
  padding: 0.5rem;
  border-radius: 0.25rem;
  transition: background-color 0.2s ease;
  display: flex;
  align-items: center;
  gap: 0.25rem;
  
  &:hover {
    background: rgba(255, 255, 255, 0.1);
  }
}

.dropdown-toggle::after {
  display: none !important;
}

.dropdown-arrow {
  transition: transform 0.2s ease;
  
  &.rotate {
    transform: rotate(180deg);
  }
}

.dropdown-menu {
  position: absolute !important;
  top: 100% !important;
  left: 0 !important;
  background: white !important;
  border: 1px solid #e5e7eb !important;
  border-radius: 0.5rem !important;
  box-shadow: 0 10px 25px -5px rgba(0, 0, 0, 0.15) !important;
  min-width: 12rem !important;
  padding: 0.5rem 0 !important;
  z-index: 99999 !important;
  
  display: none !important;
  opacity: 0 !important;
  visibility: hidden !important;
  pointer-events: none !important;
  
  &.dropdown-menu-right {
    right: 0 !important;
    left: auto !important;
  }
  
  &.dropdown-menu-visible {
    display: block !important;
    opacity: 1 !important;
    visibility: visible !important;
    pointer-events: auto !important;
  }
}

.dropdown-item {
  display: block !important;
  width: 100% !important;
  padding: 0.75rem 1rem !important;
  color: #374151 !important;
  text-decoration: none !important;
  background: none;
  border: none;
  text-align: left !important;
  cursor: pointer !important;
  font-size: 0.875rem;
  transition: background-color 0.2s ease;
  
  &:hover:not(.disabled) {
    background: #f3f4f6 !important;
    color: #1f2937 !important;
  }
  
  &.disabled {
    opacity: 0.5 !important;
    cursor: not-allowed;
    color: #9ca3af !important;
    
    &:hover {
      background: transparent !important;
      color: #9ca3af !important;
    }
  }
}

.logout-btn {
  border-top: 1px solid #e5e7eb !important;
  margin-top: 0.25rem !important;
  padding-top: 0.75rem !important;
  color: #dc2626 !important;
  
  &:hover {
    background: #fef2f2 !important;
    color: #dc2626 !important;
  }
}

// Responsive adjustments
@media (max-width: 768px) {
  .navbar-left {
    gap: 1rem;
  }
  
  .create-recipe-btn {
    padding: 0.375rem 0.75rem;
    font-size: 0.8rem;
    
    span {
      display: none; // Hide text on small screens
    }
  }
  
  .modal-container {
    margin: 0.5rem;
    max-height: 95vh;
    max-width: 95vw;
  }
  
  .modal-header, .modal-body, .modal-footer {
    padding: 1rem;
  }
  
  .toast-container {
    right: 10px;
    left: 10px;
    top: 60px; // Adjust for mobile navbar
  }
  
  .toast {
    min-width: auto;
    max-width: none;
  }
}
</style>