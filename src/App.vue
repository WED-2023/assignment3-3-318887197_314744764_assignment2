<template>
  <div id="app">
    <div id="nav" class="d-flex justify-content-between align-items-center">
      <div>
        <router-link :to="{ name: 'main' }">Recipes</router-link>
        <span v-if="username" class="ms-3">
          Hello {{ username }}
          <button @click="logout" class="btn btn-link p-0 ms-2">Logout</button>
        </span>
        <span v-else>
          Hello guest
          <router-link :to="{ name: 'register' }" class="ms-2">Register</router-link>
          <router-link :to="{ name: 'login' }" class="ms-2">Login</router-link>
        </span>
      </div>
      <div>
        <router-link :to="{ name: 'search' }" class="me-3">Search</router-link>
        <router-link :to="{ name: 'about' }">About</router-link>
      </div>
    </div>
    <router-view />
  </div>
</template>

<script>
import store from '@/store';
import { computed } from 'vue';
import axios from 'axios';
import { useRouter } from 'vue-router';

export default {
  name: "App",
  setup() {
    const router = useRouter();
    
    const username = computed(() => {
      return store.username;
    });

    const logout = async () => {
      try {
        // Send logout request to server
        await axios.post(store.server_domain + '/Logout', {}, { withCredentials: true });
        
        // Clear local store
        store.logout();
        
        // Redirect to main page
        router.push({ name: 'main' });
        
        console.log('Logout successful');
      } catch (err) {
        console.error('Logout error:', err);
        // Even if server request fails, clear local store
        store.logout();
        router.push({ name: 'main' });
      }
    };

    return { 
      username,
      logout 
    };
  }
}
</script>

<style lang="scss">
@import "@/scss/form-style.scss";

#app {
  font-family: Avenir, Helvetica, Arial, sans-serif;
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
  color: #2c3e50;
  min-height: 100vh;
}

#nav {
  padding: 30px;
  background: #f8f9fa;
  border-bottom: 1px solid #e3e3e3;
}

#nav a {
  font-weight: bold;
  color: #2c3e50;
}

#nav a.router-link-exact-active {
  color: #42b983;
}
</style>
