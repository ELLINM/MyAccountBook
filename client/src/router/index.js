// client/src/router/index.js

import { createRouter, createWebHistory } from "vue-router";
import store from "../store"; // Import the Vuex store

// Import components
import HomeView from "../views/HomeView.vue"; // Main landing page
import LoginRegister from "../views/LoginRegister.vue"; // Login/Registration component
import DashboardView from "../views/DashboardView.vue";
import CategoriesView from "../views/CategoriesView.vue";
import TransactionsView from "../views/TransactionsView.vue";
import ReportsView from "../views/ReportsView.vue"; // Still a skeleton, not fully implemented yet

const routes = [
  {
    path: "/",
    name: "Home",
    // It's generally better to show a HomeView initially and handle redirects
    // based on authentication state within the HomeView or via navigation guards.
    // Given LoginRegister component exists, HomeView will serve as a general entry.
    component: HomeView,
    meta: { requiresAuth: false }, // No authentication required for Home
  },
  {
    path: "/auth", // Use /auth path for LoginRegister component
    name: "Auth",
    component: LoginRegister,
    meta: { requiresAuth: false }, // No authentication required for Auth
  },
  {
    path: "/dashboard",
    name: "Dashboard",
    component: DashboardView,
    meta: { requiresAuth: true }, // Authentication required
  },
  {
    path: "/transactions",
    name: "Transactions",
    component: TransactionsView,
    meta: { requiresAuth: true }, // Authentication required
  },
  {
    path: "/categories",
    name: "Categories",
    component: CategoriesView,
    meta: { requiresAuth: true }, // Authentication required
  },
  {
    path: "/reports",
    name: "Reports",
    component: ReportsView,
    meta: { requiresAuth: true }, // Authentication required
  },
  // Catch-all route for 404 (optional)
  {
    path: "/:catchAll(.*)", // Vue Router 4 syntax for catch-all
    name: "NotFound",
    // Redirect to home page if route is not found (can be a dedicated 404 page)
    redirect: "/",
  },
];

const router = createRouter({
  history: createWebHistory(process.env.BASE_URL),
  routes,
});

// Navigation guard: Uses Vuex store for authentication check
router.beforeEach((to, from, next) => {
  const requiresAuth = to.meta.requiresAuth;
  // Get authentication status from Vuex store
  const isAuthenticated = store.getters["auth/isAuthenticated"];

  if (requiresAuth && !isAuthenticated) {
    // If authentication is required and user is not authenticated, redirect to /auth
    next("/auth");
  } else if (!requiresAuth && isAuthenticated && to.path === "/auth") {
    // If authentication is not required, but user is authenticated and trying to go to /auth, redirect to dashboard
    next("/dashboard");
  } else if (!requiresAuth && isAuthenticated && to.name === "Home") {
    // Optional: If user is authenticated and trying to access the Home page, redirect to Dashboard
    next("/dashboard");
  } else {
    // Otherwise, allow navigation
    next();
  }
});

export default router;
