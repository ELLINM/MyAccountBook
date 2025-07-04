// client/src/router/index.js
import { createRouter, createWebHistory } from "vue-router";
import AuthView from "../views/AuthView.vue"; // Will be created soon
import DashboardView from "../views/DashboardView.vue"; // Will be created soon
import TransactionsView from "../views/TransactionsView.vue"; // Will be created soon
import CategoriesView from "../views/CategoriesView.vue"; // Will be created soon
import ReportsView from "../views/ReportsView.vue"; // Will be created soon

const routes = [
  {
    path: "/",
    name: "Home",
    redirect: "/dashboard", // Redirect root to dashboard after login
  },
  {
    path: "/auth",
    name: "Auth",
    component: AuthView,
    meta: { requiresAuth: false }, // No authentication needed for auth page
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
    meta: { requiresAuth: true },
  },
  {
    path: "/categories",
    name: "Categories",
    component: CategoriesView,
    meta: { requiresAuth: true },
  },
  {
    path: "/reports",
    name: "Reports",
    component: ReportsView,
    meta: { requiresAuth: true },
  },
  // Catch-all route for 404 (optional)
  {
    path: "/:catchAll(.*)",
    name: "NotFound",
    redirect: "/dashboard", // Redirect to dashboard or a dedicated 404 page
  },
];

const router = createRouter({
  history: createWebHistory(process.env.BASE_URL),
  routes,
});

// Navigation Guard: Check authentication before routing
router.beforeEach((to, from, next) => {
  const requiresAuth = to.meta.requiresAuth;
  const isAuthenticated = localStorage.getItem("token"); // Check if a token exists in localStorage

  if (requiresAuth && !isAuthenticated) {
    // If route requires auth and user is not authenticated, redirect to login page
    next("/auth");
  } else if (!requiresAuth && isAuthenticated && to.path === "/auth") {
    // If user is authenticated and tries to go to auth page, redirect to dashboard
    next("/dashboard");
  } else {
    // Otherwise, proceed
    next();
  }
});

export default router;
