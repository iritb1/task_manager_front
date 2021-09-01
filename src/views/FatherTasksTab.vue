<template>
  <div>
    <FatherTasksTable />
  </div>
</template>

<script>
import { mapGetters } from "vuex";
export default {
  name: "FatherTasksTab",
  components: {
    FatherTasksTable: () =>
      import(
        /* webpackChunkName : "FatherTasksTable" */ "../components/FatherTasksTable"
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
            action: "routeToFatherTasksTable",
          },
        });
      }
    });
  },
};
</script>
