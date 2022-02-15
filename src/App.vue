<template>
  <v-app>
    <v-app-bar app color="primary" style="font-family: 'Roboto', sans-serif">
      <v-tabs color="orange">
        <div class="d-flex" style="margin-left: 0px">
          <v-img
          style="margin-left:10px"
            alt="Headon Logo"
            class="shrink mr-2"
            contain
            src="@/assets/IsraelElectric.svg.png"
            transition="scale-transition"
            width="75"
          />
        </div>

        <v-tab v-if="isLogedIn" to="/calander"><div>לוח שנה</div></v-tab>
        <v-tab v-if="isLogedIn" to="/tasks"><div>משימות</div></v-tab>
        <!-- <v-tab v-if="isLogedIn" to="/gantt"><div>גאנטט</div></v-tab>
        <v-tab v-if="isLogedIn" to="/map"><div>מפה</div></v-tab> -->
        <v-tab v-if="isLogedIn" to="/work-templates">שבלונות עבודה</v-tab>
        <v-tab v-if="isLogedIn" to="/schedule-tasks">עבודות חוזרות</v-tab>
        <v-tab v-if="isLogedIn" to="/reports">דוחות</v-tab>

        <v-tab v-else to="/login"><div>התחברות</div></v-tab>
      </v-tabs>
      <v-spacer></v-spacer>
      <div class="userData" v-if="isLogedIn" style="display: flex">
        <v-chip label color="white" outlined style="font-size: 15px">
          <v-icon left style="font-size: 18px; margin-top: 0">
            mdi-account-outline
          </v-icon>
          {{ this.$store.state.userData.name }}
        </v-chip>
        <v-chip label color="white" outlined style="font-size: 15px">
          <v-icon style="transform: rotate(180deg)" color="white" left>
            mdi-label
          </v-icon>
          {{ this.roleDescription }}
        </v-chip>
        <v-btn color="#b3c3da" @click="logOut">התנתק</v-btn>
      </div>
    </v-app-bar>

    <v-main>
      <!-- <keep-alive> -->
      <router-view />
      <!-- </keep-alive> -->
      <FatherTaskDialog />
      <vue-confirm-dialog></vue-confirm-dialog>
      <v-dialog v-model="$store.state.loading" width="300">
        <v-card color="primary" dark>
          <v-card-text>
            טוען נתונים
            <v-progress-linear
              indeterminate
              color="white"
              class="mb-0"
            ></v-progress-linear>
          </v-card-text>
        </v-card>
      </v-dialog>
      <snackbar />
    </v-main>
  </v-app>
</template>

<script>
import FatherTaskDialog from "./components/FatherTaskDialog";
import snackbar from "./components/snackbar";
import { mapGetters, mapActions } from "vuex";
import axios from "axios";
import { api } from "./apiConfig";
export default {
  name: "App",
  components: { snackbar, FatherTaskDialog },
  computed: {
    ...mapGetters("userData", ["isLogedIn", "roleDescription"]),
  },
  methods: {
    // ...mapActions("metadata", ["fetchMetadata"]),
    ...mapActions("userData", ["logOut"]),
  },
  mounted() {},
};
</script>

<style >
/* * .v-tooltip__content { */
  /* font-family: "Roboto", sans-serif im !important; */
  /* font-family: "Courier New", Courier, monospace; */
/* } */

* {
  font-family: "Roboto", sans-serif;
}

* .v-tab {
  color: white !important;
  font-size: 1rem !important;
  /* font-family: Arial, Helvetica, sans-serif; */
}

.userData > * {
  margin: auto 8px auto auto;
}

/* roboto-100 - latin */
@font-face {
  font-family: "Roboto";
  font-style: normal;
  font-weight: 100;
  src: url("./fonts/roboto-v20-latin-100.eot"); /* IE9 Compat Modes */
  src: local("Roboto Thin"), local("Roboto-Thin"),
    url("./fonts/roboto-v20-latin-100.eot?#iefix") format("embedded-opentype"),
    /* IE6-IE8 */ url("./fonts/roboto-v20-latin-100.woff2") format("woff2"),
    /* Super Modern Browsers */ url("./fonts/roboto-v20-latin-100.woff")
      format("woff"),
    /* Modern Browsers */ url("./fonts/roboto-v20-latin-100.ttf")
      format("truetype"),
    /* Safari, Android, iOS */ url("./fonts/roboto-v20-latin-100.svg#Roboto")
      format("svg"); /* Legacy iOS */
}
/* roboto-regular - latin */
@font-face {
  font-family: "Roboto";
  font-style: normal;
  font-weight: 400;
  src: url("./fonts/roboto-v20-latin-regular.eot"); /* IE9 Compat Modes */
  src: local("Roboto"), local("Roboto-Regular"),
    url("./fonts/roboto-v20-latin-regular.eot?#iefix")
      format("embedded-opentype"),
    /* IE6-IE8 */ url("./fonts/roboto-v20-latin-regular.woff2") format("woff2"),
    /* Super Modern Browsers */ url("./fonts/roboto-v20-latin-regular.woff")
      format("woff"),
    /* Modern Browsers */ url("./fonts/roboto-v20-latin-regular.ttf")
      format("truetype"),
    /* Safari, Android, iOS */
      url("./fonts/roboto-v20-latin-regular.svg#Roboto") format("svg"); /* Legacy iOS */
}
/* roboto-500 - latin */
@font-face {
  font-family: "Roboto";
  font-style: normal;
  font-weight: 500;
  src: url("./fonts/roboto-v20-latin-500.eot"); /* IE9 Compat Modes */
  src: local("Roboto Medium"), local("Roboto-Medium"),
    url("./fonts/roboto-v20-latin-500.eot?#iefix") format("embedded-opentype"),
    /* IE6-IE8 */ url("./fonts/roboto-v20-latin-500.woff2") format("woff2"),
    /* Super Modern Browsers */ url("./fonts/roboto-v20-latin-500.woff")
      format("woff"),
    /* Modern Browsers */ url("./fonts/roboto-v20-latin-500.ttf")
      format("truetype"),
    /* Safari, Android, iOS */ url("./fonts/roboto-v20-latin-500.svg#Roboto")
      format("svg"); /* Legacy iOS */
}
</style>
