<template>
  <div class="container">
    <div class="row justify-content-center">
      <div class="col-md-6">
        <div class="card shadow">
          <div class="card-body">
            <h2 class="card-title text-center mb-4">Register</h2>
            
            <form @submit.prevent="handleRegister">
              <div class="mb-3">
                <label for="username" class="form-label">Username</label>
                <input
                  type="text"
                  class="form-control"
                  id="username"
                  v-model="registerForm.username"
                  :class="{ 'is-invalid': errors.username }"
                  required
                />
                <div v-if="errors.username" class="invalid-feedback">
                  {{ errors.username }}
                </div>
              </div>
              
              <div class="row">
                <div class="col-md-6 mb-3">
                  <label for="firstname" class="form-label">First Name</label>
                  <input
                    type="text"
                    class="form-control"
                    id="firstname"
                    v-model="registerForm.firstname"
                    :class="{ 'is-invalid': errors.firstname }"
                    required
                  />
                  <div v-if="errors.firstname" class="invalid-feedback">
                    {{ errors.firstname }}
                  </div>
                </div>
                
                <div class="col-md-6 mb-3">
                  <label for="lastname" class="form-label">Last Name</label>
                  <input
                    type="text"
                    class="form-control"
                    id="lastname"
                    v-model="registerForm.lastname"
                    :class="{ 'is-invalid': errors.lastname }"
                    required
                  />
                  <div v-if="errors.lastname" class="invalid-feedback">
                    {{ errors.lastname }}
                  </div>
                </div>
              </div>
              
              <div class="mb-3">
                <label for="email" class="form-label">Email</label>
                <input
                  type="email"
                  class="form-control"
                  id="email"
                  v-model="registerForm.email"
                  :class="{ 'is-invalid': errors.email }"
                  required
                />
                <div v-if="errors.email" class="invalid-feedback">
                  {{ errors.email }}
                </div>
              </div>
              
              <div class="mb-3">
                <label for="country" class="form-label">Country</label>
                <input
                  type="text"
                  class="form-control"
                  id="country"
                  v-model="registerForm.country"
                  :class="{ 'is-invalid': errors.country }"
                  required
                />
                <div v-if="errors.country" class="invalid-feedback">
                  {{ errors.country }}
                </div>
              </div>
              
              <div class="mb-3">
                <label for="password" class="form-label">Password</label>
                <input
                  type="password"
                  class="form-control"
                  id="password"
                  v-model="registerForm.password"
                  :class="{ 'is-invalid': errors.password }"
                  required
                />
                <div class="form-text">Must be 5-10 characters with at least one number and one special character</div>
                <div v-if="errors.password" class="invalid-feedback">
                  {{ errors.password }}
                </div>
              </div>
              
              <div v-if="authError" class="alert alert-danger">
                {{ authError }}
              </div>
              
              <div v-if="successMessage" class="alert alert-success">
                {{ successMessage }}
              </div>
              
              <button type="submit" class="btn btn-primary w-100" :disabled="authLoading">
                <span v-if="authLoading" class="spinner-border spinner-border-sm me-2" role="status"></span>
                {{ authLoading ? 'Registering...' : 'Register' }}
              </button>
            </form>
            
            <div class="text-center mt-3">
              <p>Already have an account? <router-link :to="{ name: 'login' }">Login here</router-link></p>
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
import { AuthAPI } from '@/composables/AuthAPI';

const router = useRouter();

// Use composables
const { register, isLoading: authLoading, error: authError } = AuthAPI();

// Reactive data
const registerForm = reactive({
  username: '',
  firstname: '',
  lastname: '',
  email: '',
  country: '',
  password: ''
});

const errors = ref({});
const successMessage = ref('');

const validateForm = () => {
  errors.value = {};
  
  // Username validation
  if (!registerForm.username) {
    errors.value.username = 'Username is required';
  } else if (registerForm.username.length < 3 || registerForm.username.length > 8) {
    errors.value.username = 'Username must be 3-8 characters';
  } else if (!/^[a-zA-Z]+$/.test(registerForm.username)) {
    errors.value.username = 'Username must contain only letters';
  }
  
  // First name validation
  if (!registerForm.firstname) {
    errors.value.firstname = 'First name is required';
  } else if (registerForm.firstname.length > 100) {
    errors.value.firstname = 'First name must be less than 100 characters';
  }
  
  // Last name validation
  if (!registerForm.lastname) {
    errors.value.lastname = 'Last name is required';
  } else if (registerForm.lastname.length > 100) {
    errors.value.lastname = 'Last name must be less than 100 characters';
  }
  
  // Email validation
  if (!registerForm.email) {
    errors.value.email = 'Email is required';
  } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(registerForm.email)) {
    errors.value.email = 'Please enter a valid email address';
  } else if (registerForm.email.length > 255) {
    errors.value.email = 'Email must be less than 255 characters';
  }
  
  // Country validation
  if (!registerForm.country) {
    errors.value.country = 'Country is required';
  } else if (registerForm.country.length > 100) {
    errors.value.country = 'Country must be less than 100 characters';
  }
  
  // Password validation
  if (!registerForm.password) {
    errors.value.password = 'Password is required';
  } else if (registerForm.password.length < 5 || registerForm.password.length > 10) {
    errors.value.password = 'Password must be 5-10 characters';
  } else if (!/(?=.*[0-9])(?=.*[^a-zA-Z0-9])/.test(registerForm.password)) {
    errors.value.password = 'Password must contain at least one number and one special character';
  }
  
  return Object.keys(errors.value).length === 0;
};

const handleRegister = async () => {
  successMessage.value = '';
  
  if (!validateForm()) {
    return;
  }

  try {
    // Use composable to register
    await register({
      username: registerForm.username,
      firstname: registerForm.firstname,
      lastname: registerForm.lastname,
      email: registerForm.email,
      country: registerForm.country,
      password: registerForm.password
    });

    successMessage.value = 'Registration successful! You can now log in.';
    
    // Reset form
    Object.keys(registerForm).forEach(key => {
      registerForm[key] = '';
    });
    
    // Redirect to login after 2 seconds
    setTimeout(() => {
      router.push({ name: 'login' });
    }, 2000);
    
  } catch (err) {
    console.error('Registration failed:', err);
    if (err.response?.status === 409) {
      errors.value.username = 'Username already taken';
    }
  }
};
</script>

<style scoped>
.container {
  margin-top: 3rem;
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

.form-text {
  font-size: 0.875rem;
  color: #6c757d;
}
</style>