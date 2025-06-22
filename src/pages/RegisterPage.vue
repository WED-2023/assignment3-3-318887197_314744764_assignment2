<template>
  <div class="container mt-4" style="max-width: 500px;">
    <h2 class="mb-4">Register</h2>
    <b-form @submit.prevent="register">
      <!-- Validation summary alert -->
      <b-alert
        variant="danger"
        class="mt-3"
        v-if="showValidationSummary && validationErrors.length"
        show
      >
        <ul class="mb-0">
          <li v-for="(err, idx) in validationErrors" :key="idx">{{ err }}</li>
        </ul>
      </b-alert>

      <!-- Username -->
      <b-form-group label="Username" label-for="username">
        <b-form-input
          id="username"
          v-model="state.username"
          @blur="v$.username.$touch()"
          :state="getValidationState(v$.username)"
        />
        <b-form-invalid-feedback v-if="v$.username.$error">
          <div v-if="!v$.username.required">Username is required.</div>
          <div v-if="v$.username.required && !v$.username.minLength">Username is too short (min 3).</div>
          <div v-if="v$.username.required && !v$.username.maxLength">Username is too long (max 8).</div>
          <div v-if="v$.username.required && !v$.username.alpha">Username must contain only letters.</div>
        </b-form-invalid-feedback>
      </b-form-group>

      <!-- First Name -->
      <b-form-group label="First Name" label-for="firstName">
        <b-form-input
          id="firstName"
          v-model="state.firstName"
          @blur="v$.firstName.$touch()"
          :state="getValidationState(v$.firstName)"
        />
        <b-form-invalid-feedback v-if="v$.firstName.$error">
          <div v-if="!v$.firstName.required">First name is required.</div>
          <div v-if="v$.firstName.required && !v$.firstName.alpha">First name must contain only letters.</div>
        </b-form-invalid-feedback>
      </b-form-group>

      <!-- Last Name -->
      <b-form-group label="Last Name" label-for="lastName">
        <b-form-input
          id="lastName"
          v-model="state.lastName"
          @blur="v$.lastName.$touch()"
          :state="getValidationState(v$.lastName)"
        />
        <b-form-invalid-feedback v-if="v$.lastName.$error">
          <div v-if="!v$.lastName.required">Last name is required.</div>
          <div v-if="v$.lastName.required && !v$.lastName.alpha">Last name must contain only letters.</div>
        </b-form-invalid-feedback>
      </b-form-group>

      <!-- Country -->
      <b-form-group label="Country" label-for="country">
        <b-form-select
          id="country"
          v-model="state.country"
          :options="countries"
          @change="v$.country.$touch()"
          :state="getValidationState(v$.country)"
        />
        <b-form-invalid-feedback v-if="v$.country.$error">
          <div v-if="state.country === 'Select a country' || !v$.country.required">Country is required.</div>
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
            :state="getValidationState(v$.password)"
          />
          <span class="input-group-text" style="cursor:pointer" @click="showPassword = !showPassword">
            <i :class="showPassword ? 'bi bi-eye-slash' : 'bi bi-eye'"></i>
          </span>
        </div>
        <b-form-invalid-feedback v-if="v$.password.$error">
          <div v-if="!v$.password.required">Password is required.</div>
          <div v-if="v$.password.required && !v$.password.minLength">Password is too short (min 5).</div>
          <div v-if="v$.password.required && !v$.password.maxLength">Password is too long (max 10).</div>
        </b-form-invalid-feedback>
      </b-form-group>

      <!-- Confirm Password -->
      <b-form-group label="Confirm Password" label-for="confirmedPassword">
        <div class="input-group">
          <input
            id="confirmedPassword"
            :type="showConfirmPassword ? 'text' : 'password'"
            class="form-control"
            v-model="state.confirmedPassword"
            @blur="v$.confirmedPassword.$touch()"
            :class="{
              'is-invalid': v$.confirmedPassword.$error,
              'is-valid': !v$.confirmedPassword.$invalid && v$.confirmedPassword.$dirty
            }"
          />
          <span class="input-group-text" style="cursor:pointer" @click="showConfirmPassword = !showConfirmPassword">
            <i :class="showConfirmPassword ? 'bi bi-eye-slash' : 'bi bi-eye'"></i>
          </span>
        </div>
        <b-form-invalid-feedback v-if="v$.confirmedPassword.$error">
          <div v-if="!v$.confirmedPassword.required">Confirmation is required.</div>
          <div v-if="v$.confirmedPassword.required && !v$.confirmedPassword.sameAs">
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
          :state="getValidationState(v$.email)"
        />
        <b-form-invalid-feedback v-if="v$.email.$error">
          <div v-if="!v$.email.required">Email is required.</div>
          <div v-if="v$.email.required && !v$.email.email">Email must be valid.</div>
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
        <router-link to="/Login">Login here</router-link>
      </div>
    </b-form>
  </div>
</template>

<script>
import { reactive, ref, computed } from 'vue';
import { useVuelidate } from '@vuelidate/core';
import { required, minLength, maxLength, alpha, sameAs, email } from '@vuelidate/validators';
import rawCountries from '../assets/countries';
import { useRouter } from 'vue-router';
import { getCurrentInstance } from 'vue';

window.axios = require('axios');
export default {
  name: 'RegisterPage',
  setup() {
    const { proxy } = getCurrentInstance();
    const server_domain = proxy.$root.store.server_domain;

    const state = reactive({
      username: '',
      firstName: '',
      lastName: '',
      password: '',
      confirmedPassword: '',
      email: '',
      country: 'Select a country',
      submitError: null,
    });

    const showPassword = ref(false);
    const showConfirmPassword = ref(false);
    const showValidationSummary = ref(false);
    const passwordValue = computed(() => state.password);

    // Countries: keep "Select a country" as the first option
    const countries = [
      'Select a country',
      ...rawCountries.map(c => c.name.common).sort((a, b) => a.localeCompare(b))
    ];

    // Validation rules
    const rules = {
      username: {
        required,
        minLength: minLength(3),
        maxLength: maxLength(8),
        alpha,
      },
      firstName: { required, alpha },
      lastName: { required, alpha },
      country: {
        required: value => value && value !== 'Select a country',
      },
      password: {
        required,
        minLength: minLength(5),
        maxLength: maxLength(10),
      },
      confirmedPassword: {
        required,
        sameAs: sameAs(passwordValue),
      },
      email: { required, email },
    };

    const v$ = useVuelidate(rules, state);
    const router = useRouter();

    // Helper for BootstrapVue validation state
    const getValidationState = (field) => {
      return field.$dirty ? !field.$invalid : null;
    };

    // Computed validation errors for summary
    const validationErrors = computed(() => {
      const errors = [];
      if (v$.value.username.$error) {
        if (!v$.value.username.required) errors.push('Username is required.');
        if (v$.value.username.required && !v$.value.username.minLength) errors.push('Username is too short (min 3).');
        if (v$.value.username.required && !v$.value.username.maxLength) errors.push('Username is too long (max 8).');
        if (v$.value.username.required && !v$.value.username.alpha) errors.push('Username must contain only letters.');
      }
      if (v$.value.firstName.$error) {
        if (!v$.value.firstName.required) errors.push('First name is required.');
        if (v$.value.firstName.required && !v$.value.firstName.alpha) errors.push('First name must contain only letters.');
      }
      if (v$.value.lastName.$error) {
        if (!v$.value.lastName.required) errors.push('Last name is required.');
        if (v$.value.lastName.required && !v$.value.lastName.alpha) errors.push('Last name must contain only letters.');
      }
      if (v$.value.country.$error) {
        if (state.country === 'Select a country' || !v$.value.country.required) errors.push('Country is required.');
      }
      if (v$.value.password.$error) {
        if (!v$.value.password.required) errors.push('Password is required.');
        if (v$.value.password.required && !v$.value.password.minLength) errors.push('Password is too short (min 5).');
        if (v$.value.password.required && !v$.value.password.maxLength) errors.push('Password is too long (max 10).');
      }
      if (v$.value.confirmedPassword.$error) {
        if (!v$.value.confirmedPassword.required) errors.push('Confirm password is required.');
        if (v$.value.confirmedPassword.required && !v$.value.confirmedPassword.sameAs) errors.push('Passwords do not match.');
      }
      if (v$.value.email.$error) {
        if (!v$.value.email.required) errors.push('Email is required.');
        if (v$.value.email.required && !v$.value.email.email) errors.push('Email is not valid.');
      }
      return errors;
    });

    const register = async () => {
      v$.value.$touch();
      const valid = await v$.value.$validate();

      if (!valid) {
        state.submitError = null;
        showValidationSummary.value = true;
        return;
      }

      showValidationSummary.value = false;

      try {
        await window.axios.post(server_domain + '/Register', {
          username: state.username,
          firstname: state.firstName,
          lastname: state.lastName,
          password: state.password,
          email: state.email,
          country: state.country,
        });
        router.push('/Login');
      } catch (err) {
        state.submitError = err.response?.data?.message || 'Unexpected error.';
      }
    };

    return {
      state,
      showPassword,
      showConfirmPassword,
      showValidationSummary,
      countries,
      register,
      v$,
      validationErrors,
      getValidationState,
    };
  },
};
</script>