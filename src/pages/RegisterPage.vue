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
          @input="usernameExistsError = ''"
          :state="getValidationState(v$.username, !!usernameExistsError)"
        />
        <b-form-invalid-feedback v-if="v$.username.$error || usernameExistsError">
          <div v-if="v$.username.required.$invalid">Username is required.</div>
          <div v-else-if="v$.username.minLength.$invalid">Username is too short (min 3).</div>
          <div v-else-if="v$.username.maxLength.$invalid">Username is too long (max 8).</div>
          <div v-else-if="v$.username.alpha.$invalid">Username must contain only letters.</div>
          <div v-else-if="usernameExistsError">{{ usernameExistsError }}</div>
          <div v-else>Unknown error</div>
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
          <div v-if="v$.firstName.required.$invalid">First name is required.</div>
          <div v-else-if="v$.firstName.alpha.$invalid">First name must contain only letters.</div>
          <div v-else>Unknown error</div>
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
          <div v-if="v$.lastName.required.$invalid">Last name is required.</div>
          <div v-else-if="v$.lastName.alpha.$invalid">Last name must contain only letters.</div>
          <div v-else>Unknown error</div>
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
          <div v-if="v$.country.required.$invalid">Country is required.</div>
          <div v-else>Unknown error</div>
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
            <b-form-invalid-feedback v-if="v$.password.$error" class="d-block">
              <div v-if="v$.password.required.$invalid">Password is required.</div>
              <div v-else-if="v$.password.minLength.$invalid">Password is too short (min 5).</div>
              <div v-else-if="v$.password.maxLength.$invalid">Password is too long (max 10).</div>
              <div v-else-if="v$.password.hasNumber.$invalid">Password must contain at least one number.</div>
              <div v-else-if="v$.password.hasSpecialChar.$invalid">Password must contain at least one special character.</div>
              <div v-else>Unknown error</div>
            </b-form-invalid-feedback>
          </div>
        </b-form-group>

      <!-- Confirm Password -->
      <b-form-group label="Confirm Password" label-for="confirmedPassword">
        <div class="input-group">
          <b-form-input
            id="confirmedPassword"
            :type="showConfirmPassword ? 'text' : 'password'"
            class="form-control"
            v-model="state.confirmedPassword"
            @blur="v$.confirmedPassword.$touch()"
            :state="getValidationState(v$.confirmedPassword)"
          />
          <span class="input-group-text" style="cursor:pointer" @click="showConfirmPassword = !showConfirmPassword">
            <i :class="showConfirmPassword ? 'bi bi-eye-slash' : 'bi bi-eye'"></i>
          </span>
          <b-form-invalid-feedback v-if="v$.confirmedPassword.$error" class="d-block">
            <div v-if="v$.confirmedPassword.required.$invalid">Confirmation is required.</div>
            <div v-else-if="v$.confirmedPassword.sameAs.$invalid">Passwords do not match.</div>
            <div v-else>Unknown error</div>
          </b-form-invalid-feedback>
        </div>
      </b-form-group>
      
      <!-- Email -->
      <b-form-group label="Email" label-for="email">
        <b-form-input
          id="email"
          type="text"
          v-model="state.email"
          @blur="v$.email.$touch()"
          :state="getValidationState(v$.email)"
        />
        <b-form-invalid-feedback v-if="v$.email.$error">
          <div v-if="v$.email.required.$invalid">Email is required.</div>
          <div v-else-if="v$.email.email.$invalid">Email must be valid.</div>
          <div v-else>Unknown error</div>
        </b-form-invalid-feedback>
      </b-form-group>

      <b-button type="submit" variant="success" class="w-100">Register</b-button>

      <b-alert
        variant="danger"
        class="mt-3"
        v-if="submitError"
        show
      >
        {{ submitError }}
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
    const usernameExistsError = ref('');
    const hasNumber = value => /[0-9]/.test(value || '');
    const hasSpecialChar = value => /[^A-Za-z0-9]/.test(value || ''); 

    const state = reactive({
      username: '',
      firstName: '',
      lastName: '',
      password: '',
      confirmedPassword: '',
      email: '',
      country: 'Select a country',
    });
    const submitError = ref(null);

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
        hasNumber,
        hasSpecialChar,
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
    const getValidationState = (field, extraError = false) => {
      if (extraError) return false; // force is-invalid
      return field.$dirty ? !field.$invalid : null;
    };

    // Computed validation errors for summary
    const validationErrors = computed(() => {
      const errors = [];
      if (v$.value.username.$error) {
        if (v$.value.username.required.$invalid) errors.push('Username is required.');
        if (v$.value.username.minLength.$invalid) errors.push('Username is too short (min 3).');
        if (v$.value.username.maxLength.$invalid) errors.push('Username is too long (max 8).');
        if (v$.value.username.alpha.$invalid) errors.push('Username must contain only letters.');
      }
      if (v$.value.firstName.$error) {
        if (v$.value.firstName.required.$invalid) errors.push('First name is required.');
        if (v$.value.firstName.alpha.$invalid) errors.push('First name must contain only letters.');
      }
      if (v$.value.lastName.$error) {
        if (v$.value.lastName.required.$invalid) errors.push('Last name is required.');
        if (v$.value.lastName.alpha.$invalid) errors.push('Last name must contain only letters.');
      }
      if (v$.value.country.$error) {
        if (v$.value.country.required.$invalid) errors.push('Country is required.');
      }
      if (v$.value.password.$error) {
        if (v$.value.password.required.$invalid) errors.push('Password is required.');
        if (v$.value.password.minLength.$invalid) errors.push('Password is too short (min 5).');
        if (v$.value.password.maxLength.$invalid) errors.push('Password is too long (max 10).');
      }
      if (v$.value.confirmedPassword.$error) {
        if (v$.value.confirmedPassword.required.$invalid) errors.push('Confirm password is required.');
        if (v$.value.confirmedPassword.sameAs.$invalid) errors.push('Passwords do not match.');
      }
      if (v$.value.email.$error) {
        if (v$.value.email.required.$invalid) errors.push('Email is required.');
        if (v$.value.email.email.$invalid) errors.push('Email must be valid.');
      }
      return errors;
    });

    const register = async () => {
      v$.value.$touch();
      const valid = await v$.value.$validate();

      if (!valid) {
        submitError.value = null;
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
      }  catch (err) {
        showValidationSummary.value = false;
        if (err.response && err.response.status === 409) {
          submitError.value = null;
          usernameExistsError.value = 'Username already exists. Please choose a different username.';
          v$.value.username.$touch();
        } else {
          submitError.value = err.response?.data?.message || 'Unexpected error.';
        }
      }
    };

    return {
      state,
      submitError,
      showPassword,
      usernameExistsError,
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