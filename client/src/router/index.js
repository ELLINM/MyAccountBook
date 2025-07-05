// client/src/router/index.js

import { createRouter, createWebHistory } from "vue-router";
import store from "../store"; // Vuex store를 import 합니다. <--- 이 부분 추가 (만약 없다면)

// 1. 컴포넌트 임포트 경로 및 이름 일관성 유지 (이전 제안과 현재 파일명을 맞춰주세요)
//    - LoginRegister.vue 파일명에 맞춰 AuthView 대신 LoginRegister로 변경
//    - 기존 DashboardView, TransactionsView, CategoriesView는 그대로 사용
//    - ReportsView는 아직 구현하지 않았으므로 그대로 둡니다.
import HomeView from "../views/HomeView.vue"; // 메인 페이지
import LoginRegister from "../views/LoginRegister.vue"; // 로그인/회원가입 컴포넌트 (AuthView 대신)
import DashboardView from "../views/DashboardView.vue";
import CategoriesView from "../views/CategoriesView.vue";
import TransactionsView from "../views/TransactionsView.vue";
import ReportsView from "../views/ReportsView.vue"; // 아직은 빈 스켈레톤 상태

const routes = [
  {
    path: "/",
    name: "Home",
    // 2. 홈 경로를 Dashboard로 리다이렉트하는 것은 로그인 후 처리가 더 자연스럽습니다.
    //    일단은 HomeView 컴포넌트를 보여주고, 로그인 상태에 따라 내부에서 리다이렉트하는 게 좋습니다.
    //    아니면 단순히 Auth 페이지로 연결하거나, HomeView를 AuthView의 역할로 사용할 수 있습니다.
    //    현재 LoginRegister 컴포넌트를 만들었으니 HomeView로 설정하고, 인증 상태에 따라 달라지게 합니다.
    component: HomeView, // HomeView를 메인으로 사용
    meta: { requiresAuth: false }, // 인증 필요 없음
  },
  {
    path: "/auth", // /auth 경로로 LoginRegister 컴포넌트 사용
    name: "Auth",
    component: LoginRegister, // <--- AuthView 대신 LoginRegister 컴포넌트 사용
    meta: { requiresAuth: false },
  },
  {
    path: "/dashboard",
    name: "Dashboard",
    component: DashboardView,
    meta: { requiresAuth: true },
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
    path: "/:catchAll(.*)", // Vue Router 4에서는 `/:pathMatch(.*)*` 또는 `/:catchAll(.*)`
    name: "NotFound",
    // 404 페이지를 따로 만드는 것이 좋지만, 일단은 홈으로 리다이렉트
    redirect: "/", // 로그인 여부와 상관없이 '/'로 리다이렉트 (여기서 홈은 HomeView)
  },
];

const router = createRouter({
  history: createWebHistory(process.env.BASE_URL),
  routes,
});

// 3. 네비게이션 가드 수정: localStorage 대신 Vuex store 사용
router.beforeEach((to, from, next) => {
  const requiresAuth = to.meta.requiresAuth;
  // Vuex 스토어에서 인증 상태 가져오기
  const isAuthenticated = store.getters["auth/isAuthenticated"]; // <--- 이 부분 수정

  if (requiresAuth && !isAuthenticated) {
    // 인증이 필요하고, 인증되지 않았다면 /auth 페이지로 리다이렉트
    next("/auth");
  } else if (!requiresAuth && isAuthenticated && to.path === "/auth") {
    // 인증이 필요 없고, 인증되어 있으며, /auth 페이지로 가려 한다면 대시보드로 리다이렉트
    next("/dashboard");
  } else if (!requiresAuth && isAuthenticated && to.name === "Home") {
    // 인증이 필요 없는 Home 페이지인데 인증된 상태라면 Dashboard로 리다이렉트 (선택 사항)
    next("/dashboard");
  } else {
    // 그 외의 경우는 정상적으로 페이지 이동 허용
    next();
  }
});

export default router;
