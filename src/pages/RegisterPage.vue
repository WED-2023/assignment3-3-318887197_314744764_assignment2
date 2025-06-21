<template>
  <div class="container mt-4" style="max-width: 500px;">
    <h2 class="mb-4">Register</h2>
    <b-form @submit.prevent="register">
      <!-- Username -->
      <b-form-group label="Username" label-for="username">
        <b-form-input
          id="username"
          v-model="state.username"
          @blur="v$.username.$touch()"
        />
        <b-form-invalid-feedback v-if="v$.username.$error">
          <div v-if="!v$.username.required">Username is required.</div>
          <div v-else-if="!v$.username.minLength || !v$.username.maxLength">
            Username must be 3–8 characters.
          </div>
          <div v-else-if="!v$.username.alpha">Username must contain only letters.</div>
        </b-form-invalid-feedback>
      </b-form-group>

      <!-- First Name -->
      <b-form-group label="First Name" label-for="firstName">
        <b-form-input
          id="firstName"
          v-model="state.firstName"
          @blur="v$.firstName.$touch()"
        />
        <b-form-invalid-feedback v-if="v$.firstName.$error">
          <div v-if="!v$.firstName.required">First name is required.</div>
          <div v-else-if="!v$.firstName.alpha">First name must contain only letters.</div>
        </b-form-invalid-feedback>
      </b-form-group>

      <!-- Last Name -->
      <b-form-group label="Last Name" label-for="lastName">
        <b-form-input
          id="lastName"
          v-model="state.lastName"
          @blur="v$.lastName.$touch()"
        />
        <b-form-invalid-feedback v-if="v$.lastName.$error">
          <div v-if="!v$.lastName.required">Last name is required.</div>
          <div v-else-if="!v$.lastName.alpha">Last name must contain only letters.</div>
        </b-form-invalid-feedback>
      </b-form-group>

      <!-- Country -->
      <b-form-group label="Country" label-for="country">
        <b-form-select
          id="country"
          v-model="state.country"
          :options="countries"
          @change="v$.country.$touch()"
        />
        <b-form-invalid-feedback v-if="v$.country.$error">
          Country is required.
        </b-form-invalid-feedback>
      </b-form-group>

      <!-- Password -->
      <b-form-group label="Password" label-for="password">
        <div class="input-group">
          <b-form-input
            id="password"
            :type="showPassword ? 'text' : 'password'"
            v-model="state.password"
            @blur="v$.password.$touch()"
          />
          <span class="input-group-text" style="cursor:pointer" @click="showPassword = !showPassword">
            <i :class="showPassword ? 'bi bi-eye-slash' : 'bi bi-eye'"></i>
          </span>
        </div>
        <b-form-invalid-feedback v-if="v$.password.$error">
          <div v-if="!v$.password.required">Password is required.</div>
          <div v-else-if="!v$.password.minLength || !v$.password.maxLength">
            Password must be 5–10 characters.
          </div>
        </b-form-invalid-feedback>
      </b-form-group>

      <!-- Confirm Password (native input) -->
      <b-form-group label="Confirm Password" label-for="confirmedPassword">
        <input
          id="confirmedPassword"
          type="password"
          class="form-control"
          v-model="state.confirmedPassword"
          @blur="v$.confirmedPassword.$touch()"
        />
        <b-form-invalid-feedback v-if="v$.confirmedPassword.$error">
          <div v-if="!v$.confirmedPassword.required">Confirmation is required.</div>
          <div v-else-if="!v$.confirmedPassword.sameAs">
            Passwords do not match.
          </div>
        </b-form-invalid-feedback>
      </b-form-group>
        
      <!-- Email -->
      <b-form-group label="Email" label-for="email">
        <b-form-input
          id="email"
          type="email"
          v-model="state.email"
          @blur="v$.email.$touch()"
        />
        <b-form-invalid-feedback v-if="v$.email.$error">
          <div v-if="!v$.email.required">Email is required.</div>
          <div v-else-if="!v$.email.email">Email must be valid.</div>
        </b-form-invalid-feedback>
      </b-form-group>

      <b-button type="submit" variant="success" class="w-100">Register</b-button>

      <b-alert
        variant="danger"
        class="mt-3"
        dismissible
        v-if="state.submitError"
        show
      >
        Registration failed: {{ state.submitError }}
      </b-alert>

      <div class="mt-2">
        Already have an account?
        <router-link to="/login">Login here</router-link>
      </div>
    </b-form>
  </div>
</template>

<script>
import { reactive, ref } from 'vue';
import { useVuelidate } from '@vuelidate/core';
import { required, minLength, maxLength, alpha, sameAs, email } from '@vuelidate/validators';
import rawCountries from '../assets/countries';
import { useRouter } from 'vue-router';

export default {
  name: 'RegisterPage',
  setup() {
    const state = reactive({
      username: '',
      firstName: '',
      lastName: '',
      password: '',
      confirmedPassword: '',
      email: '',
      country: '',
      submitError: null,
    });

    const showPassword = ref(false);

    const rules = {
      username: {
        required,
        minLength: minLength(3),
        maxLength: maxLength(8),
        alpha,
      },
      firstName: { required, alpha },
      lastName: { required, alpha },
      country: { required },
      password: {
        required,
        minLength: minLength(5),
        maxLength: maxLength(10),
      },
      confirmedPassword: {
        required,
        sameAs: sameAs(() => state.password),
      },
      email: { required, email },
    };

    const v$ = useVuelidate(rules, state);
    const router = useRouter();

    const register = async () => {
      const valid = await v$.value.$validate();

      if (!valid) {
        state.submitError = 'Please fix the errors above.';
        console.log('Password:', state.password);
        console.log('Confirmed Password:', state.confirmedPassword);
        console.log('Validation errors:');

        Object.entries(v$.value).forEach(([key, val]) => {
        if (val && val.$invalid !== undefined && val.$invalid) {
          console.log(`Field "${key}" is invalid`, val);
        }
  });
      }

      try {
        await window.axios.post('/Register', {
          username: state.username,
          firstname: state.firstName,
          lastname: state.lastName,
          password: state.password,
          email: state.email,
          country: state.country,
        });
        window.toast('Registration successful', 'You can now login', 'success');
        router.push('/login');
      } catch (err) {
        state.submitError = err.response?.data?.message || 'Unexpected error.';
      }
    };

    return {
      state,
      showPassword,
      countries: [
        'Select a country',
        ...rawCountries
          .map(c => c.name.common)
          .sort((a, b) => a.localeCompare(b))
      ],
      register,
      v$,
    };
  },
};
</script>