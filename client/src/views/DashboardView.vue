<template>
  <div class="dashboard">
    <h1>Dashboard</h1>
    <p>Hello, {{ currentUser?.email }}!</p>
    <p>Welcome. This page is accessible only after logging in.</p>
    <p>
      You can manage categories or transactions via the left menu or top
      navigation bar.
    </p>
    <router-link to="/categories" class="dashboard-link"
      >Manage Categories</router-link
    >
    <router-link to="/transactions" class="dashboard-link"
      >Manage Transactions</router-link
    >
  </div>
</template>

<script>
  import { mapGetters } from "vuex";

  export default {
    name: "DashboardView", // Ensure this matches the file name consistency
    computed: {
      ...mapGetters("auth", ["currentUser"]),
    },
  };
</script>

<style scoped>
  .dashboard {
    text-align: center;
    margin-top: 50px;
    padding: 20px;
    background-color: #f9f9f9;
    border-radius: 8px;
    box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
  }

  .dashboard-link {
    display: inline-block;
    margin: 10px;
    padding: 10px 20px;
    background-color: #007bff;
    color: white;
    text-decoration: none;
    border-radius: 5px;
    transition: background-color 0.3s ease;
  }

  .dashboard-link:hover {
    background-color: #0056b3;
  }
</style>
