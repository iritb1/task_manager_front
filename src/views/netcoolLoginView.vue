<template>
  <div>
    <div>User {{ $route.params }}</div>
  </div>
</template>

<script>
import { mapActions } from "vuex";
export default {
  name: "netcoolView",
  methods: {
    ...mapActions("userData", ["login", "loadUserData"]),
  },
  beforeRouteEnter(to, from, next) {
    next((vm) => {
      //if the url has query (?query)
      if (Object.keys(to.query).length !== 0) {
        if ("sid" in to.query) {
          var today = new Date();
          var expire = new Date();
          expire.setTime(today.getTime() + 3600000 * 24 * 14);
          document.cookie =
            `sid=Bearer ${to.query.sid};path=/` +
            ";expires=" +
            expire.toGMTString();
        }
      }
      vm.$router.push({
        name: "login",
      });
    });
  },
};
</script>
