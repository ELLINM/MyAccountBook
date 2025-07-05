<template>
  <div class="page-container">
    <h1>Category Management</h1>
    <p>
      Category list and add/edit/delete functionalities will be implemented
      here.
    </p>
    <router-link to="/dashboard">Back to Dashboard</router-link>
  </div>
</template>

<script>
  export default {
    name: "CategoriesView", // Ensure this matches the file name consistency
  };
</script>

<style scoped>
  .page-container {
    max-width: 800px;
    margin: 50px auto;
    padding: 20px;
    border: 1px solid #ccc;
    border-radius: 8px;
    box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
    background-color: #fff;
  }
</style>
