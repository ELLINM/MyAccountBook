<template>
  <div id="app">
    <nav>
      <router-link to="/">Home</router-link> |
      <router-link v-if="!isAuthenticated" to="/auth"
        >Login/Register</router-link
      >
      <router-link v-if="isAuthenticated" to="/dashboard"
        >Dashboard</router-link
      >
      |
      <router-link v-if="isAuthenticated" to="/categories"
        >Categories</router-link
      >
      |
      <router-link v-if="isAuthenticated" to="/transactions"
        >Transactions</router-link
      >
      |
      <router-link v-if="isAuthenticated" to="/reports">Reports</router-link>
      <a v-if="isAuthenticated" class="logout-link" @click="handleLogout"
        >Logout</a
      >
    </nav>
    <router-view />
  </div>
</template>

<script>
  import { mapGetters, mapActions } from "vuex"; // 2칸 들여쓰기, 큰따옴표

  export default {
    name: "App", // 2칸 들여쓰기, 큰따옴표
    computed: {
      ...mapGetters("auth", ["isAuthenticated", "currentUser"]), // 4칸 들여쓰기, 큰따옴표
    },
    methods: {
      ...mapActions("auth", ["logout"]), // 4칸 들여쓰기, 큰따옴표
      async handleLogout() {
        await this.logout();
        this.$router.push("/"); // 6칸 들여쓰기, 큰따옴표
      },
    }, // 세미콜론 추가
  };
</script>

<style>
  #app {
    font-family: Avenir, Helvetica, Arial, sans-serif;
    -webkit-font-smoothing: antialiased;
    -moz-osx-font-smoothing: grayscale;
    text-align: center;
    color: #2c3e50;
  }

  nav {
    padding: 30px;
    background-color: #f8f8f8;
    border-bottom: 1px solid #eee;
  }

  nav a {
    font-weight: bold;
    color: #2c3e50;
    text-decoration: none;
    padding: 0 10px;
  }

  nav a.router-link-exact-active {
    color: #42b983;
  }

  .logout-link {
    cursor: pointer;
    color: #dc3545;
    margin-left: 10px;
    font-weight: bold;
  }

  .logout-link:hover {
    text-decoration: underline;
  }
</style>
