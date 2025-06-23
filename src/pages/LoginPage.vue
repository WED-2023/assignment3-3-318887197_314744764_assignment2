<template>
  <div class="container mt-4" style="max-width: 400px;">
    <h2 class="mb-4">Login</h2>
    <b-form @submit.prevent="login">
      <!-- Username -->
      <b-form-group label="Username" label-for="username">
        <b-form-input
          id="username"
          v-model="state.username"
          :state="getValidationState(v$.username, !!loginFailedError)"
          @input="loginFailedError = ''"
          @blur="v$.username.$touch()"
        />
        <b-form-invalid-feedback v-if="v$.username.$error || loginFailedError">
          <div v-if="v$.username.required.$invalid">Username is required.</div>
          <div v-else-if="loginFailedError">{{ loginFailedError }}</div>
        </b-form-invalid-feedback>
      </b-form-group>

      <!-- Password -->
      <b-form-group label="Password" label-for="password">
        <div class="input-group">
          <b-form-input
            id="password"
            :type="showPassword ? 'text' : 'password'"
            v-model="state.password"
            :state="getValidationState(v$.password, !!loginFailedError)"
            @input="loginFailedError = ''"
            @blur="v$.password.$touch()"
          />
          <span class="input-group-text" style="cursor:pointer" @click="showPassword = !showPassword">
            <i :class="showPassword ? 'bi bi-eye-slash' : 'bi bi-eye'"></i>
          </span>
        </div>
        <b-form-invalid-feedback v-if="v$.password.$error || loginFailedError">
          <div v-if="v$.password.required.$invalid">Password is required.</div>
          <div v-else-if="loginFailedError">{{ loginFailedError }}</div>
        </b-form-invalid-feedback>
      </b-form-group>

      <b-button type="submit" variant="primary" class="w-100">Login</b-button>

      <div class="mt-2">
        Don’t have an account?
        <router-link to="/register">Register here</router-link>
      </div>
    </b-form>
  </div>
</template>

<script>
import { reactive, ref } from 'vue';
import { useVuelidate } from '@vuelidate/core';
import { required } from '@vuelidate/validators';
import axios from 'axios';
import { useRouter } from 'vue-router';
import store from '@/store'; // Import store directly

export default {
  name: 'LoginPage',
  setup() {
    const showPassword = ref(false);
    const router = useRouter();
    const server_domain = store.server_domain;
    const attemptedLogin = ref(false);

    const state = reactive({
      username: '',
      password: '',
    });

    const rules = {
      username: { required },
      password: { required },
    };

    const v$ = useVuelidate(rules, state);
    const loginFailedError = ref('');

    const getValidationState = (field, hasServerError = false) => {
      if (hasServerError) return false; // show red if server error
      // Only show red if the field is dirty and invalid, otherwise no color
      if (field.$dirty && field.$invalid) return false;
      return null; 
    };

    const login = async () => {
      attemptedLogin.value = true;
      loginFailedError.value = '';
      v$.value.$touch();
      const valid = await v$.value.$validate();
      if (!valid) return;

      axios.defaults.withCredentials = true; // Ensure cookies are sent with requests
      try {
        await axios.post(server_domain + '/Login', {
          username: state.username,
          password: state.password,
          },
          { withCredentials: true }
        );

        await new Promise(resolve => setTimeout(resolve, 100));

        const meResponse = await axios.get(
          server_domain + '/me',
          { withCredentials: true }
        );

        await new Promise(resolve => setTimeout(resolve, 100));
        
        console.log('Setting store.username to:', meResponse.data.username);
        store.username = meResponse.data.username;
        console.log('Store.username is now:', store.username);
        
        router.push({ name: 'main' });
      } catch (err) {
        console.error('Login error:', err);
        console.error('Error response:', err.response);
        if (err.response && err.response.status === 401) {
          loginFailedError.value = 'Username or password is incorrect.';
          v$.value.username.$touch();
          v$.value.password.$touch();
        } else {
          loginFailedError.value = 'Unexpected error. Please try again.';
        }
      }
    };
    return { state, v$, login, getValidationState, loginFailedError, showPassword };
  },
};
</script>