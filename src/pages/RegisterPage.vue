<template>
  <div class="container">
    <div class="row justify-content-center">
      <div class="col-md-6">
        <div class="card shadow">
          <div class="card-body">
            <h2 class="card-title text-center mb-4">Register</h2>
            
            <!-- Validation summary alert -->
            <div
              v-if="showValidationSummary && validationErrors.length"
              class="alert alert-danger"
            >
              <ul class="mb-0">
                <li v-for="(err, idx) in validationErrors" :key="idx">{{ err }}</li>
              </ul>
            </div>
            
            <form @submit.prevent="handleRegister">
              <!-- Username -->
              <div class="mb-3">
                <label for="username" class="form-label">Username</label>
                <input
                  type="text"
                  class="form-control"
                  id="username"
                  v-model="registerForm.username"
                  :class="getUsernameValidationClass()"
                  @blur="touchedFields.username = true"
                  @input="usernameExistsError = ''"
                  required
                />
                <div v-if="getUsernameValidationClass().includes('is-invalid')" class="invalid-feedback">
                  <div v-if="!registerForm.username && touchedFields.username">Username is required.</div>
                  <div v-else-if="registerForm.username && registerForm.username.length < 3">Username is too short (min 3).</div>
                  <div v-else-if="registerForm.username && registerForm.username.length > 8">Username is too long (max 8).</div>
                  <div v-else-if="registerForm.username && !/^[a-zA-Z]+$/.test(registerForm.username)">Username must contain only letters.</div>
                  <div v-else-if="usernameExistsError">{{ usernameExistsError }}</div>
                </div>
                <div v-if="getUsernameValidationClass().includes('is-valid')" class="valid-feedback">
                  Username looks good!
                </div>
              </div>
              
              <div class="row">
                <!-- First Name -->
                <div class="col-md-6 mb-3">
                  <label for="firstname" class="form-label">First Name</label>
                  <input
                    type="text"
                    class="form-control"
                    id="firstname"
                    v-model="registerForm.firstname"
                    :class="getFirstnameValidationClass()"
                    @blur="touchedFields.firstname = true"
                    required
                  />
                  <div v-if="getFirstnameValidationClass().includes('is-invalid')" class="invalid-feedback">
                    <div v-if="!registerForm.firstname && touchedFields.firstname">First name is required.</div>
                    <div v-else-if="registerForm.firstname && !/^[a-zA-Z\s]+$/.test(registerForm.firstname)">First name must contain only letters.</div>
                  </div>
                  <div v-if="getFirstnameValidationClass().includes('is-valid')" class="valid-feedback">
                    Looks good!
                  </div>
                </div>
                
                <!-- Last Name -->
                <div class="col-md-6 mb-3">
                  <label for="lastname" class="form-label">Last Name</label>
                  <input
                    type="text"
                    class="form-control"
                    id="lastname"
                    v-model="registerForm.lastname"
                    :class="getLastnameValidationClass()"
                    @blur="touchedFields.lastname = true"
                    required
                  />
                  <div v-if="getLastnameValidationClass().includes('is-invalid')" class="invalid-feedback">
                    <div v-if="!registerForm.lastname && touchedFields.lastname">Last name is required.</div>
                    <div v-else-if="registerForm.lastname && !/^[a-zA-Z\s]+$/.test(registerForm.lastname)">Last name must contain only letters.</div>
                  </div>
                  <div v-if="getLastnameValidationClass().includes('is-valid')" class="valid-feedback">
                    Looks good!
                  </div>
                </div>
              </div>
              
              <!-- Email -->
              <div class="mb-3">
                <label for="email" class="form-label">Email</label>
                <input
                  type="email"
                  class="form-control"
                  id="email"
                  v-model="registerForm.email"
                  :class="getEmailValidationClass()"
                  @blur="touchedFields.email = true"
                  required
                />
                <div v-if="getEmailValidationClass().includes('is-invalid')" class="invalid-feedback">
                  <div v-if="!registerForm.email && touchedFields.email">Email is required.</div>
                  <div v-else-if="registerForm.email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(registerForm.email)">Please enter a valid email address.</div>
                </div>
                <div v-if="getEmailValidationClass().includes('is-valid')" class="valid-feedback">
                  Email looks good!
                </div>
              </div>
              
              <!-- Country -->
              <div class="mb-3">
                <label for="country" class="form-label">Country</label>
                <select
                  class="form-select"
                  id="country"
                  v-model="registerForm.country"
                  :class="getCountryValidationClass()"
                  @change="touchedFields.country = true"
                  required
                >
                  <option value="">Select a country</option>
                  <option v-for="country in countries" :key="country" :value="country">
                    {{ country }}
                  </option>
                </select>
                <div v-if="getCountryValidationClass().includes('is-invalid')" class="invalid-feedback">
                  <div v-if="!registerForm.country && touchedFields.country">Country is required.</div>
                </div>
                <div v-if="getCountryValidationClass().includes('is-valid')" class="valid-feedback">
                  Country selected!
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
                    v-model="registerForm.password"
                    :class="getPasswordValidationClass()"
                    @blur="touchedFields.password = true"
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
                <div class="form-text">Must be 5-10 characters with at least one number and one special character</div>
                <div v-if="getPasswordValidationClass().includes('is-invalid')" class="invalid-feedback">
                  <div v-if="!registerForm.password && touchedFields.password">Password is required.</div>
                  <div v-else-if="registerForm.password && (registerForm.password.length < 5 || registerForm.password.length > 10)">Password must be 5-10 characters.</div>
                  <div v-else-if="registerForm.password && !/(?=.*[0-9])/.test(registerForm.password)">Password must contain at least one number.</div>
                  <div v-else-if="registerForm.password && !/(?=.*[^a-zA-Z0-9])/.test(registerForm.password)">Password must contain at least one special character.</div>
                </div>
                <div v-if="getPasswordValidationClass().includes('is-valid')" class="valid-feedback">
                  Strong password!
                </div>
              </div>

              <!-- Confirm Password -->
              <div class="mb-3">
                <label for="confirmPassword" class="form-label">Confirm Password</label>
                <div class="input-group">
                  <input
                    :type="showConfirmPassword ? 'text' : 'password'"
                    class="form-control"
                    id="confirmPassword"
                    v-model="registerForm.confirmPassword"
                    :class="getConfirmPasswordValidationClass()"
                    @blur="touchedFields.confirmPassword = true"
                    required
                  />
                  <button
                    class="btn btn-outline-secondary"
                    type="button"
                    @click="showConfirmPassword = !showConfirmPassword"
                  >
                    <i :class="showConfirmPassword ? 'fas fa-eye-slash' : 'fas fa-eye'"></i>
                  </button>
                </div>
                <div v-if="getConfirmPasswordValidationClass().includes('is-invalid')" class="invalid-feedback">
                  <div v-if="!registerForm.confirmPassword && touchedFields.confirmPassword">Confirmation is required.</div>
                  <div v-else-if="registerForm.confirmPassword && registerForm.confirmPassword !== registerForm.password">Passwords do not match.</div>
                </div>
                <div v-if="getConfirmPasswordValidationClass().includes('is-valid')" class="valid-feedback">
                  Passwords match!
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
import { ref, reactive, computed } from 'vue';
import { useRouter } from 'vue-router';
import { AuthAPI } from '@/composables/AuthAPI';
import rawCountries from '@/assets/countries';

const router = useRouter();

// Use composables
const { register, isLoading: authLoading, error: authError } = AuthAPI();

// Countries list
const countries = rawCountries.map(c => c.name.common).sort((a, b) => a.localeCompare(b));

// Reactive data
const registerForm = reactive({
  username: '',
  firstname: '',
  lastname: '',
  email: '',
  country: '',
  password: '',
  confirmPassword: ''
});

const touchedFields = reactive({
  username: false,
  firstname: false,
  lastname: false,
  email: false,
  country: false,
  password: false,
  confirmPassword: false
});

const usernameExistsError = ref('');
const successMessage = ref('');
const showPassword = ref(false);
const showConfirmPassword = ref(false);
const showValidationSummary = ref(false);

// Validation helper functions
const isUsernameValid = () => {
  return registerForm.username && 
         registerForm.username.length >= 3 && 
         registerForm.username.length <= 8 && 
         /^[a-zA-Z]+$/.test(registerForm.username) &&
         !usernameExistsError.value;
};

const isFirstnameValid = () => {
  return registerForm.firstname && /^[a-zA-Z\s]+$/.test(registerForm.firstname);
};

const isLastnameValid = () => {
  return registerForm.lastname && /^[a-zA-Z\s]+$/.test(registerForm.lastname);
};

const isEmailValid = () => {
  return registerForm.email && /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(registerForm.email);
};

const isCountryValid = () => {
  return registerForm.country && registerForm.country !== '';
};

const isPasswordValid = () => {
  return registerForm.password && 
         registerForm.password.length >= 5 && 
         registerForm.password.length <= 10 &&
         /(?=.*[0-9])/.test(registerForm.password) &&
         /(?=.*[^a-zA-Z0-9])/.test(registerForm.password);
};

const isConfirmPasswordValid = () => {
  return registerForm.confirmPassword && registerForm.confirmPassword === registerForm.password;
};

// Validation class functions
const getUsernameValidationClass = () => {
  if (!touchedFields.username && !registerForm.username) return '';
  if (usernameExistsError.value) return 'is-invalid';
  if (touchedFields.username || registerForm.username) {
    return isUsernameValid() ? 'is-valid' : 'is-invalid';
  }
  return '';
};

const getFirstnameValidationClass = () => {
  if (!touchedFields.firstname && !registerForm.firstname) return '';
  if (touchedFields.firstname || registerForm.firstname) {
    return isFirstnameValid() ? 'is-valid' : 'is-invalid';
  }
  return '';
};

const getLastnameValidationClass = () => {
  if (!touchedFields.lastname && !registerForm.lastname) return '';
  if (touchedFields.lastname || registerForm.lastname) {
    return isLastnameValid() ? 'is-valid' : 'is-invalid';
  }
  return '';
};

const getEmailValidationClass = () => {
  if (!touchedFields.email && !registerForm.email) return '';
  if (touchedFields.email || registerForm.email) {
    return isEmailValid() ? 'is-valid' : 'is-invalid';
  }
  return '';
};

const getCountryValidationClass = () => {
  if (!touchedFields.country && !registerForm.country) return '';
  if (touchedFields.country || registerForm.country) {
    return isCountryValid() ? 'is-valid' : 'is-invalid';
  }
  return '';
};

const getPasswordValidationClass = () => {
  if (!touchedFields.password && !registerForm.password) return '';
  if (touchedFields.password || registerForm.password) {
    return isPasswordValid() ? 'is-valid' : 'is-invalid';
  }
  return '';
};

const getConfirmPasswordValidationClass = () => {
  if (!touchedFields.confirmPassword && !registerForm.confirmPassword) return '';
  if (touchedFields.confirmPassword || registerForm.confirmPassword) {
    return isConfirmPasswordValid() ? 'is-valid' : 'is-invalid';
  }
  return '';
};

// Computed validation errors for summary
const validationErrors = computed(() => {
  const errors = [];
  
  if (touchedFields.username || registerForm.username) {
    if (!registerForm.username) errors.push('Username is required.');
    else if (registerForm.username.length < 3) errors.push('Username is too short (min 3).');
    else if (registerForm.username.length > 8) errors.push('Username is too long (max 8).');
    else if (!/^[a-zA-Z]+$/.test(registerForm.username)) errors.push('Username must contain only letters.');
  }
  
  if (touchedFields.firstname || registerForm.firstname) {
    if (!registerForm.firstname) errors.push('First name is required.');
    else if (!/^[a-zA-Z\s]+$/.test(registerForm.firstname)) errors.push('First name must contain only letters.');
  }
  
  if (touchedFields.lastname || registerForm.lastname) {
    if (!registerForm.lastname) errors.push('Last name is required.');
    else if (!/^[a-zA-Z\s]+$/.test(registerForm.lastname)) errors.push('Last name must contain only letters.');
  }
  
  if (touchedFields.email || registerForm.email) {
    if (!registerForm.email) errors.push('Email is required.');
    else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(registerForm.email)) errors.push('Email must be valid.');
  }
  
  if (touchedFields.country || registerForm.country) {
    if (!registerForm.country) errors.push('Country is required.');
  }
  
  if (touchedFields.password || registerForm.password) {
    if (!registerForm.password) errors.push('Password is required.');
    else if (registerForm.password.length < 5 || registerForm.password.length > 10) errors.push('Password must be 5-10 characters.');
    else if (!/(?=.*[0-9])/.test(registerForm.password)) errors.push('Password must contain at least one number.');
    else if (!/(?=.*[^a-zA-Z0-9])/.test(registerForm.password)) errors.push('Password must contain at least one special character.');
  }
  
  if (touchedFields.confirmPassword || registerForm.confirmPassword) {
    if (!registerForm.confirmPassword) errors.push('Confirm password is required.');
    else if (registerForm.confirmPassword !== registerForm.password) errors.push('Passwords do not match.');
  }
  
  return errors;
});

const validateForm = () => {
  // Touch all fields to trigger validation display
  Object.keys(touchedFields).forEach(key => {
    touchedFields[key] = true;
  });
  
  return isUsernameValid() && 
         isFirstnameValid() && 
         isLastnameValid() && 
         isEmailValid() && 
         isCountryValid() && 
         isPasswordValid() && 
         isConfirmPasswordValid() &&
         !usernameExistsError.value;
};

const handleRegister = async () => {
  successMessage.value = '';
  usernameExistsError.value = '';
  
  if (!validateForm()) {
    showValidationSummary.value = true;
    return;
  }

  showValidationSummary.value = false;

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
    Object.keys(touchedFields).forEach(key => {
      touchedFields[key] = false;
    });
    
    // Redirect to login after 2 seconds
    setTimeout(() => {
      router.push({ name: 'login' });
    }, 2000);
    
  } catch (err) {
    console.error('Registration failed:', err);
    if (err.response?.status === 409) {
      usernameExistsError.value = 'Username already exists. Please choose a different username.';
      touchedFields.username = true;
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

.input-group .btn {
  border-left: 0;
}

.form-control:focus + .btn,
.form-control.is-valid + .btn,
.form-control.is-invalid + .btn {
  border-color: inherit;
}
</style>