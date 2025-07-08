// src/components/HelloWorld.vue
<script>
  export default {
    props: {
      msg: {
        type: String,
        default: "Welcome to Your Vue.js App", // You can set any default string here
      },
      // If it was already { type: String, required: true }, then you might remove `required: true`
      // or keep it if 'msg' must always be provided by the parent.
      // If it must always be provided, then this warning is incorrect and can be disabled for that line.
      // But typically, Vue suggests providing a default if not required.
    },
  };
</script>
