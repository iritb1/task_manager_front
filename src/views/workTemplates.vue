<template>
  <div class="home">
    <templateTable />
  </div>
</template>

<script>
import { mapGetters, mapActions } from "vuex";
export default {
  name: "Work-Tamplate",
  components: {
    templateTable: () =>
      import(
        /* webpackChunkName : "templateTable" */ "../components/templateTable"
      ),
  },
  computed: {
    ...mapGetters("userData", ["isLogedIn"]),
  },
  beforeRouteEnter(to, from, next) {
    next((vm) => {
      if (!vm.isLogedIn) {
        vm.$router.push({
          name: "login",
          params: {
            action: "routeToTemplateTable",
          },
        });
      }
    });
  },
};
</script>
