import Main from "../pages/MainPage.vue";
import NotFound from "../pages/NotFoundPage.vue";
import { createRouter, createWebHistory } from 'vue-router';

const routes = [
  {
    path: "/",
    name: "main",
    component: Main,
  },
  {
    path: "/register",
    name: "register",
    component: () => import("../pages/RegisterPage.vue"),
  },
  {
    path: "/login",
    name: "login",
    component: () => import("../pages/LoginPage.vue"),
  },
  {
    path: "/search",
    name: "search",
    component: () => import("../pages/SearchPage.vue"),
  },
  {
  path: "/recipe/:recipeId",
  name: "recipe",
  component: () => import("../pages/RecipeViewPage.vue"),
  props: route => ({ 
    recipeId: route.params.recipeId,
    ...route.params 
  }),
  beforeEnter: (to, from, next) => {
    // Validate that recipeId exists
    if (!to.params.recipeId) {
      console.error('Recipe ID is required');
      next({ name: 'main' });
    } else {
      next();
    }
  }
},
  {
    path: "/about",
    name: "about",
    component: () => import("../pages/AboutPage.vue"),
  },
  {
    path: '/favorites',
    name: 'favorites',
    component: () => import('@/pages/FavoritePage.vue'),
    meta: { requiresAuth: true }
  },
  {
    path: '/personal',
    name: 'personal',
    component: () => import('@/pages/PersonalPage.vue'),
    meta: { requiresAuth: true }
  }, 
  {
    path: '/familia',
    name: 'familia',
    component: () => import('@/pages/FamiliaPage.vue'), 
    meta: { requiresAuth: true }
  },
  {
    path: "/:catchAll(.*)",
    name: "notFound",
    component: NotFound,
  }
];

const router = createRouter({
  history: createWebHistory(process.env.BASE_URL),
  routes
});

export default router;