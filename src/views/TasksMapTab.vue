<template>
  <div>
    <TasksMap />
  </div>
</template>

<script>
import { mapGetters } from "vuex";
export default {
  name: "TasksMapTab",
  components: {
    TasksMap: () =>
      import(
        /* webpackChunkName : "TasksMap" */ "../components/TasksMap"
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
            action: "routeToTasksMap",
          },
        });
      }
    });
  },
};
</script>
