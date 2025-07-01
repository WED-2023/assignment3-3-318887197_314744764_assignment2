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
                <!-- Only Favorites is functional -->
                <router-link :to="{ name: 'favorites' }" class="dropdown-item">Favorites ⭐</router-link>
                <router-link :to="{ name: 'personal' }" class="dropdown-item">Private</router-link>
                <a href="#" @click.prevent class="dropdown-item disabled">La Familia</a>
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
                <!-- Only Logout is functional -->
                <button @click="logout" class="dropdown-item logout-btn">Sign Out</button>
              </div>
            </div>
          </div>
          
          <!-- Guest Section -->
          <div v-else class="guest-section">
            <!-- Login and Register are functional -->
            <router-link :to="{ name: 'login' }" class="auth-link">Login</router-link>
            <router-link :to="{ name: 'register' }" class="auth-link">Register</router-link>
          </div>
        </div>
      </div>
    </nav>
    
    <router-view />
  </div>
</template>

<script setup>
import store from '@/store';
import { computed, ref, onMounted, onUnmounted } from 'vue';
import axios from 'axios';
import { useRouter } from 'vue-router';

const router = useRouter();

// Reactive state
const showPersonalDropdown = ref(false);
const showUserDropdown = ref(false);
const personalClickedOpen = ref(false);
const userClickedOpen = ref(false);

// Computed
const username = computed(() => store.username);

// Methods
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
    
    // Close user dropdown
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
    
    // Close personal dropdown
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

// Lifecycle
onMounted(() => {
  document.addEventListener('click', closeDropdowns);
});

onUnmounted(() => {
  document.removeEventListener('click', closeDropdowns);
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

// Change .navbar to .custom-navbar
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
  width: 100%; // Change from max-width: 1200px to full width
  margin: 0; // Remove auto centering
  padding: 0; // Remove padding to make items flush
}

.navbar-left {
  display: flex;
  align-items: center;
  gap: 2rem;
  padding-left: 1rem; // Add padding only to the left content
}

.navbar-right {
  display: flex;
  align-items: center;
  gap: 1rem;
  margin-left: auto;
  padding-right: 1rem; // Add padding only to the right content
}

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
  display: none !important; // Remove Bootstrap's default dropdown arrow
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

</style>