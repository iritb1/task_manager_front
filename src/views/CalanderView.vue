<template>
  <div class="home">
    <Calendar />
  </div>
</template>

<script>
import { mapGetters } from "vuex";
export default {
  name: "CalanderView",
  components: {
    Calendar: () =>
      import(/* webpackChunkName : "Calander" */ "../components/Calendar")
  },
  computed: {
    ...mapGetters("userData", ["isLogedIn"])
  },
  beforeRouteEnter(to, from, next) {
    next(vm => {
      if (!vm.isLogedIn) {
        vm.$router.push("/login");
      }
    });
  }
};
</script>
