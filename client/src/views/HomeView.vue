<template>
  <div class="home">
    <h1>My Personal Account Book</h1>
    <p>Please log in or register to get started.</p>
    <p v-if="isAuthenticated">Welcome, {{ currentUser?.email }}!</p>
  </div>
</template>

<script>
  import { mapGetters } from "vuex";

  export default {
    name: "HomeView",
    computed: {
      ...mapGetters("auth", ["isAuthenticated", "currentUser"]),
    },
  };
</script>

<style scoped>
  .home {
    text-align: center;
    margin-top: 50px;
  }
</style>
