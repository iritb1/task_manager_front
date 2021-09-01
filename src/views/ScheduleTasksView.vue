<template>
  <div>
    <ScheduleTasksTable />
  </div>
</template>

<script>
import { mapGetters } from "vuex";
export default {
  name: "ScheduleTasksView",
  components: {
    ScheduleTasksTable: () =>
      import(
        /* webpackChunkName : "ScheduleTasksTable" */ "../components/ScheduleTasksTable"
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
            action: "routeToScheduleTasks",
          },
        });
      }
    });
  },
};
</script>
