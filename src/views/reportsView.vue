<template>
  <reportArea />
</template>

<script>
import { mapGetters } from "vuex";
export default {
  name: "reportsView",
  components: {
    reportArea: () =>
      import(
        /* webpackChunkName : "ScheduleTasksTable" */ "../components/reportsArea"
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
            action: "routeToReportsView",
          },
        });
      }
    });
  },
};
</script>
