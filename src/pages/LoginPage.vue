<template>
  <div class="container">
    <div class="row justify-content-center">
      <div class="col-md-6">
        <div class="card shadow">
          <div class="card-body">
            <h2 class="card-title text-center mb-4">Login</h2>
            
            <form @submit.prevent="handleLogin">
              <div class="mb-3">
                <label for="username" class="form-label">Username</label>
                <input
                  type="text"
                  class="form-control"
                  id="username"
                  v-model="loginForm.username"
                  :class="{ 'is-invalid': errors.username }"
                  required
                />
                <div v-if="errors.username" class="invalid-feedback">
                  {{ errors.username }}
                </div>
              </div>
              
              <div class="mb-3">
                <label for="password" class="form-label">Password</label>
                <input
                  type="password"
                  class="form-control"
                  id="password"
                  v-model="loginForm.password"
                  :class="{ 'is-invalid': errors.password }"
                  required
                />
                <div v-if="errors.password" class="invalid-feedback">
                  {{ errors.password }}
                </div>
              </div>
              
              <div v-if="authError" class="alert alert-danger">
                {{ authError }}
              </div>
              
              <button type="submit" class="btn btn-primary w-100" :disabled="authLoading">
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
import { ref, reactive } from 'vue';
import { useRouter } from 'vue-router';
import store from '@/store';
import { AuthAPI } from '@/composables/AuthAPI';

const router = useRouter();

// Use composables
const { login, isLoading: authLoading, error: authError } = AuthAPI();

// Reactive data
const loginForm = reactive({
  username: '',
  password: ''
});

const errors = ref({});

const validateForm = () => {
  errors.value = {};
  
  if (!loginForm.username) {
    errors.value.username = 'Username is required';
  } else if (loginForm.username.length < 3 || loginForm.username.length > 8) {
    errors.value.username = 'Username must be 3-8 characters';
  } else if (!/^[a-zA-Z]+$/.test(loginForm.username)) {
    errors.value.username = 'Username must contain only letters';
  }
  
  if (!loginForm.password) {
    errors.value.password = 'Password is required';
  } else if (loginForm.password.length < 5 || loginForm.password.length > 10) {
    errors.value.password = 'Password must be 5-10 characters';
  }
  
  return Object.keys(errors.value).length === 0;
};

const handleLogin = async () => {
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
    
    // Redirect to main page
    router.push({ name: 'main' });
    
  } catch (err) {
    console.error('Login failed:', err);
    if (err.response?.status === 401) {
      errors.value.password = 'Invalid username or password';
    }
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

.btn-primary:hover {
  background-color: #2980b9;
  border-color: #2980b9;
}

a {
  color: #3498db;
  text-decoration: none;
}

a:hover {
  text-decoration: underline;
}
</style>