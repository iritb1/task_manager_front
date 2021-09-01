<template>
  <div>
    <GanttChart />
  </div>
</template>

<script>
import { mapGetters } from "vuex";
export default {
  name: "TasksMapTab",
  components: {
    GanttChart: () =>
      import(
        /* webpackChunkName : "GanttChart" */ "../components/GanttChart"
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
            action: "routeToGantt",
          },
        });
      }
    });
  },
};
</script>
