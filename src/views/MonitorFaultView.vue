<template>
  <div>
    <div>User {{ $route.params.id }}</div>
  </div>
</template>

<script>
import { mapActions } from "vuex";
export default {
  name: "MonitorFaultView",
  methods: {
    ...mapActions("userData", ["login", "loadUserData"]),
  },
  beforeRouteEnter(to, from, next) {
    next((vm) => {
      if (!vm.isLogedIn) {
        if ("sid" in to.query) {
          var today = new Date();
          var expire = new Date();
          expire.setTime(today.getTime() + 3600000 * 24 * 14);
          document.cookie =
            `sid=Bearer ${to.query.sid};path=/` +
            ";expires=" +
            expire.toGMTString();
        }
        vm.$router.push({
          name: "login",
          params: {
            action: "openFault",
            actionParams: { id: vm.$route.params.id },
          },
        });
      }
    });
  },
};
</script>
