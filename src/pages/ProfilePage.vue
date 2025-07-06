<template>
  <div class="profile-page">
    <div class="container my-5">
      <div class="row justify-content-center">
        <div class="col-lg-8">
          <!-- Loading State -->
          <div v-if="isLoading" class="text-center">
            <div class="spinner-border text-primary" role="status">
              <span class="visually-hidden">Loading...</span>
            </div>
            <p class="mt-3">Loading profile...</p>
          </div>

          <!-- Error State -->
          <div v-else-if="error" class="alert alert-danger">
            <i class="fas fa-exclamation-triangle me-2"></i>
            {{ error }}
          </div>

          <!-- Profile Content -->
          <div v-else-if="userProfile" class="profile-content">
            <!-- Profile Header -->
            <div class="profile-header text-center mb-5">
              <div class="profile-avatar mb-3">
                <i class="fas fa-user-circle fa-5x text-primary"></i>
              </div>
              <h1 class="display-5 mb-2">{{ userProfile.username }}</h1>
              <p class="text-muted">
                <i class="fas fa-map-marker-alt me-2"></i>
                {{ userProfile.country }}
              </p>
            </div>

            <!-- Profile Information Cards -->
            <div class="row">
              <!-- Basic Information -->
              <div class="col-md-6 mb-4">
                <div class="card h-100">
                  <div class="card-header bg-primary text-white">
                    <h5 class="mb-0">
                      <i class="fas fa-user me-2"></i>
                      Basic Information
                    </h5>
                  </div>
                  <div class="card-body">
                    <div class="info-item mb-3">
                      <strong>Username:</strong>
                      <span class="ms-2">{{ userProfile.username }}</span>
                    </div>
                    <div class="info-item mb-3">
                      <strong>First Name:</strong>
                      <span class="ms-2">{{ userProfile.firstname }}</span>
                    </div>
                    <div class="info-item">
                      <strong>Last Name:</strong>
                      <span class="ms-2">{{ userProfile.lastname }}</span>
                    </div>
                  </div>
                </div>
              </div>

              <!-- Contact Information -->
              <div class="col-md-6 mb-4">
                <div class="card h-100">
                  <div class="card-header bg-success text-white">
                    <h5 class="mb-0">
                      <i class="fas fa-envelope me-2"></i>
                      Contact Information
                    </h5>
                  </div>
                  <div class="card-body">
                    <div class="info-item mb-3">
                      <strong>Email:</strong>
                      <span class="ms-2">{{ userProfile.email }}</span>
                    </div>
                    <div class="info-item">
                      <strong>Country:</strong>
                      <span class="ms-2">
                        <i class="fas fa-flag me-2"></i>
                        {{ userProfile.country }}
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <!-- Welcome Message -->
            <div class="welcome-card mb-4">
              <div class="card">
                <div class="card-body text-center">
                  <h5 class="card-title">
                    <i class="fas fa-utensils me-2 text-primary"></i>
                    Welcome to Your Recipe Collection!
                  </h5>
                  <p class="card-text text-muted">
                    Start creating and organizing your favorite recipes. Share family traditions and discover new culinary adventures.
                  </p>
                </div>
              </div>
            </div>

            <!-- Action Buttons -->
            <div class="text-center mt-4">
            <router-link :to="{ name: 'personal' }" class="btn btn-outline-primary me-3">
                <i class="fas fa-book me-2"></i>
                My Recipes
            </router-link>
            <router-link :to="{ name: 'favorites' }" class="btn btn-outline-primary me-3">
                <i class="fas fa-star me-2"></i>
                My Favorites
            </router-link>
            <router-link :to="{ name: 'familia' }" class="btn btn-outline-success">
                <i class="fas fa-heart me-2"></i>
                Family Recipes
            </router-link>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue';
import axios from 'axios';
import store from '@/store';

// Reactive data for managing profile page state
const userProfile = ref(null);          // Stores the user's profile information from API
const isLoading = ref(true);            // Loading state for profile data fetch
const error = ref('');                  // Error message if profile fetch fails

// Fetch user profile from /me endpoint
const fetchUserProfile = async () => {
  try {
    isLoading.value = true;             // Show loading spinner
    error.value = '';                   // Clear any previous errors
    
    // Make authenticated request to get user profile data
    const response = await axios.get(store.server_domain + '/me', {
      withCredentials: true             // Include cookies for authentication
    });
    
    console.log('User profile data:', response.data);
    userProfile.value = response.data;  // Store profile data in reactive variable
    
  } catch (err) {
    console.error('Error fetching user profile:', err);
    error.value = 'Failed to load profile information. Please try again.';
  } finally {
    isLoading.value = false;            // Hide loading spinner regardless of success/failure
  }
};

// fetch profile data when component mounts
onMounted(() => {
  fetchUserProfile();
});
</script>

<style scoped>
.profile-page {
  min-height: calc(100vh - 50px);
  background: #f8f9fa;
}

.profile-header {
  background: white;
  border-radius: 1rem;
  padding: 2rem;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
}

.profile-avatar {
  color: #0d6efd;
}

.card {
  border: none;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
  transition: transform 0.2s ease;
}

.card:hover {
  transform: translateY(-2px);
}

.card-header {
  border-bottom: none;
  border-radius: 0.5rem 0.5rem 0 0;
}

.info-item {
  padding: 0.5rem 0;
  border-bottom: 1px solid #f1f3f4;
}

.info-item:last-child {
  border-bottom: none;
}

.welcome-card {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  border-radius: 1rem;
  color: white;
}

.welcome-card .card {
  background: rgba(255, 255, 255, 0.1);
  border: none;
  backdrop-filter: blur(10px);
}

.welcome-card .card-body {
  padding: 2rem;
}

.btn {
  border-radius: 0.5rem;
  font-weight: 500;
  padding: 0.75rem 1.5rem;
}

@media (max-width: 768px) {
  .profile-header {
    padding: 1.5rem;
  }
  
  .container {
    padding: 1rem;
  }
  
  .btn {
    margin-bottom: 0.5rem;
    width: 100%;
  }
  
  .btn:last-child {
    margin-bottom: 0;
  }
}
</style>