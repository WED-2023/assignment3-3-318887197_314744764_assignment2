<template>
  <div id="app">
    <div id="nav" class="d-flex justify-content-between align-items-center">
      <div>
        <router-link :to="{ name: 'main' }">Recipes</router-link>
        <span v-if="!store.username" class="ms-3">
          Hello Guest
          <router-link :to="{ name: 'register' }" class="ms-2">Register</router-link>
          <router-link :to="{ name: 'login' }" class="ms-2">Login</router-link>
        </span>
        <span v-else class="ms-3">
          {{ store.username }}:
          <button @click="logout" class="btn btn-link p-0 ms-2">Logout</button>
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
import { getCurrentInstance } from 'vue';

export default {
  name: "App",
  setup() {
    const internalInstance = getCurrentInstance();
    const store = internalInstance.appContext.config.globalProperties.store;
    const toast = internalInstance.appContext.config.globalProperties.toast;
    const router = internalInstance.appContext.config.globalProperties.$router;

    const logout = () => {
      store.logout();
      toast("Logout", "User logged out successfully", "success");
      router.push("/").catch(() => {});
    };

    return { store, logout };
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
