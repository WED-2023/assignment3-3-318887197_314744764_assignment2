<template>
  <div class="container">
    <div class="row justify-content-center">
      <div class="col-md-6">
        <div class="card shadow">
          <div class="card-body">
            <h2 class="card-title text-center mb-4">Login</h2>
            
            <form @submit.prevent="handleLogin">
              <!-- Username -->
              <div class="mb-3">
                <label for="username" class="form-label">Username</label>
                <input
                  type="text"
                  class="form-control"
                  id="username"
                  v-model="loginForm.username"
                  :class="getUsernameValidationClass()"
                  @blur="touchedFields.username = true"
                  @input="clearLoginError"
                  required
                />
                <div v-if="getUsernameValidationClass().includes('is-invalid')" class="invalid-feedback">
                  <div v-if="loginError">{{ loginError }}</div>
                  <div v-else-if="!loginForm.username && touchedFields.username">Username is required.</div>
                  <div v-else-if="loginForm.username && (loginForm.username.length < 3 || loginForm.username.length > 8)">Username must be 3-8 characters.</div>
                  <div v-else-if="loginForm.username && !/^[a-zA-Z]+$/.test(loginForm.username)">Username must contain only letters.</div>
                </div>
                <div v-if="getUsernameValidationClass().includes('is-valid')" class="valid-feedback">
                  Username looks good!
                </div>
              </div>
              
              <!-- Password -->
              <div class="mb-3">
                <label for="password" class="form-label">Password</label>
                <div class="input-group">
                  <input
                    :type="showPassword ? 'text' : 'password'"
                    class="form-control"
                    id="password"
                    v-model="loginForm.password"
                    :class="getPasswordValidationClass()"
                    @blur="touchedFields.password = true"
                    @input="clearLoginError"
                    required
                  />
                  <button
                    class="btn btn-outline-secondary"
                    type="button"
                    @click="showPassword = !showPassword"
                  >
                    <i :class="showPassword ? 'fas fa-eye-slash' : 'fas fa-eye'"></i>
                  </button>
                </div>
                <div v-if="getPasswordValidationClass().includes('is-invalid')" class="invalid-feedback">
                  <div v-if="loginError">{{ loginError }}</div>
                  <div v-else-if="!loginForm.password && touchedFields.password">Password is required.</div>
                  <div v-else-if="loginForm.password && (loginForm.password.length < 5 || loginForm.password.length > 10)">Password must be 5-10 characters.</div>
                </div>
                <div v-if="getPasswordValidationClass().includes('is-valid')" class="valid-feedback">
                  Password format is correct!
                </div>
              </div>
              
              <div v-if="authError" class="alert alert-danger">
                {{ authError }}
              </div>
              
              <button type="submit" class="btn btn-primary w-100" :disabled="authLoading || !isFormValid">
                <span v-if="authLoading" class="spinner-border spinner-border-sm me-2" role="status"></span>
                {{ authLoading ? 'Logging in...' : 'Login' }}
              </button>
            </form>
            
            <div class="text-center mt-3">
              <p>Don't have an account? <router-link :to="{ name: 'register' }">Register here</router-link></p>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, reactive, computed } from 'vue';
import { useRouter } from 'vue-router';
import store from '@/store';
import { AuthAPI } from '@/composables/AuthAPI';
import { FavoritesAPI } from '@/composables/FavoritesAPI';
import { LikesAPI } from '@/composables/LikesAPI';

// Router instance for navigation after successful login
const router = useRouter();

// Use composables for API operations
const { login, isLoading: authLoading, error: authError } = AuthAPI();
const { getFavorites } = FavoritesAPI();
const { getLiked } = LikesAPI();

// Reactive data for form fields
const loginForm = reactive({
  username: '',
  password: ''
});

// Track which fields have been touched by user for validation display
const touchedFields = reactive({
  username: false,
  password: false
});

// Toggle password visibility
const showPassword = ref(false);
// Store login-specific error messages
const loginError = ref('');

// Validation helper functions
const isUsernameValid = () => {
  return loginForm.username && 
         loginForm.username.length >= 3 && 
         loginForm.username.length <= 8 && 
         /^[a-zA-Z]+$/.test(loginForm.username);
};

const isPasswordValid = () => {
  return loginForm.password && 
         loginForm.password.length >= 5 && 
         loginForm.password.length <= 10;
};

// Validation class functions for Bootstrap styling
const getUsernameValidationClass = () => {
  if (!touchedFields.username && !loginForm.username) return '';
  
  // If there's a login error, mark as invalid
  if (loginError.value) return 'is-invalid';
  
  if (touchedFields.username || loginForm.username) {
    return isUsernameValid() ? 'is-valid' : 'is-invalid';
  }
  return '';
};

const getPasswordValidationClass = () => {
  if (!touchedFields.password && !loginForm.password) return '';
  
  // If there's a login error, mark as invalid
  if (loginError.value) return 'is-invalid';
  
  if (touchedFields.password || loginForm.password) {
    return isPasswordValid() ? 'is-valid' : 'is-invalid';
  }
  return '';
};

// Computed properties
const isFormValid = computed(() => {
  return isUsernameValid() && isPasswordValid() && !loginError.value;
});

// Methods
const clearLoginError = () => {
  loginError.value = '';
};

const validateForm = () => {
  // Touch all fields to trigger validation display
  touchedFields.username = true;
  touchedFields.password = true;
  
  return isUsernameValid() && isPasswordValid();
};

const handleLogin = async () => {
  loginError.value = '';
  
  if (!validateForm()) {
    return;
  }

  try {
    // Use composable to login
    await login({
      username: loginForm.username,
      password: loginForm.password
    });

    // Set username in store
    store.username = loginForm.username;
    
    // Load user's data after login
    try {
      const [favoriteIds, likedIds] = await Promise.all([
        getFavorites(),
        getLiked()
      ]);
      
      store.initializeUserData(favoriteIds, likedIds);
      console.log('LoginPage: User data loaded after login');
    } catch (error) {
      console.error('Error loading user data after login:', error);
    }
    
    // Redirect to main page
    router.push({ name: 'main' });
    
  } catch (err) {
    console.error('Login failed:', err);
    
    // Set login error and mark both fields as touched to show red state
    loginError.value = 'Username or password incorrect';
    touchedFields.username = true;
    touchedFields.password = true;
  }
};
</script>

<style scoped>
.container {
  margin-top: 5rem;
}

.card {
  border: none;
  border-radius: 10px;
}

.card-title {
  color: #2c3e50;
  font-weight: 600;
}

.btn-primary {
  background-color: #3498db;
  border-color: #3498db;
  font-weight: 500;
}

.btn-primary:hover:not(:disabled) {
  background-color: #2980b9;
  border-color: #2980b9;
}

.btn-primary:disabled {
  opacity: 0.6;
  cursor: not-allowed;
}

a {
  color: #3498db;
  text-decoration: none;
}

a:hover {
  text-decoration: underline;
}

.input-group .btn {
  border-left: 0;
}

.form-control:focus + .btn,
.form-control.is-valid + .btn,
.form-control.is-invalid + .btn {
  border-color: inherit;
}
</style>