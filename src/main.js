import { createApp } from 'vue';
import App from './App.vue';
import router from './router/index'; // This imports the router from your router/index.js
import axios from 'axios';
import VueAxios from 'vue-axios';
// Remove this line - you don't need to import createRouter here since you're importing the router instance
// import { createRouter, createWebHistory } from 'vue-router';
import { AuthAPI } from '@/composables/AuthAPI'

import 'bootstrap/dist/css/bootstrap.css';
import 'bootstrap/dist/js/bootstrap.bundle.js';

// BootstrapVue 3
import BootstrapVue3 from 'bootstrap-vue-3';
import 'bootstrap-vue-3/dist/bootstrap-vue-3.css';
import { BContainer, BRow, BCol } from 'bootstrap-vue-3';
import Vuelidate from '@vuelidate/core';

import store from './store';

// Remove this entire section - you already imported the router above
/*
const router = createRouter({
  history: createWebHistory(),
  routes  // <- This 'routes' variable doesn't exist here
});
*/

// Axios interceptors
axios.interceptors.request.use((config) => config, (error) => Promise.reject(error));
axios.interceptors.response.use((response) => response, (error) => Promise.reject(error));

// Create app
const app = createApp(App);

// Plugins
app.use(router); // Use the imported router
app.use(VueAxios, axios);
app.use(BootstrapVue3);
app.use(Vuelidate); 

const { checkAuth } = AuthAPI()

// Register global BootstrapVue3 components
app.component('BContainer', BContainer);
app.component('BRow', BRow);
app.component('BCol', BCol);

// Global store
app.config.globalProperties.store = store;

checkAuth().then(() => {
  app.mount('#app')
}).catch(() => {
  // Handle auth check failure
  console.log('No existing session found')
  app.mount('#app')
})