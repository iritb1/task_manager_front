<template>
  <v-card
    style="margin-top: 100px; margin-right: auto; margin-left: auto"
    width="600px"
    class="elevation-12"
    @keyup.enter="onlogin"
  >
    <v-toolbar color="primary" dark flat>
      <v-toolbar-title>פרטי התחברות</v-toolbar-title>
      <v-spacer></v-spacer>
      <v-tooltip bottom></v-tooltip>
    </v-toolbar>
    <v-card-text>
      <v-form ref="form" v-model="valid" lazy-validation>
        <v-text-field
          ref="user"
          label="שם משתמש"
          name="login"
          prepend-icon="mdi-account"
          :rules="usernameRules"
          v-model="userName"
        ></v-text-field>

        <v-text-field
        ref="pass"
          id="password"
          label="סיסמה"
          name="password"
          prepend-icon="mdi-lock"
          type="password"
          :rules="passwordRules"
          v-model="password"
        ></v-text-field>
      </v-form>
    </v-card-text>
    <v-card-actions>
      <v-spacer></v-spacer>
      <v-btn color="primary" @click="onlogin">התחבר</v-btn>
    </v-card-actions>
  </v-card>
</template>

<script>
import { mapActions } from "vuex";
import { api } from "../apiConfig";
import axios from "axios";
export default {
  name: "Login",
  data: function () {
    return {
      userName: "",
      usernameRules: [
        (v) => !!v || "חובה למלא שם משתמש",
        (v) => (v && v.length <= 10) || "שם משתמש עד 10 תווים",
      ],
      password: "",
      passwordRules: [
        (v) => !!v || "חובה למלא סיסמה",
        (v) => (v && v.length >= 4) || "סיסמא חייבת להיות לפחות 4 תווים",
      ],
      valid: true,
    };
  },
  methods: {
    ...mapActions("userData", ["login", "loadUserData"]),
    ...mapActions("metadata", ["fetchMetadata"]),
    afterLogin() {
      switch (this.action) {
        case "openFault":
          this.$router.push("/calander");
          this.$root.$emit("call-father-task-dialog", {
            fatherTaskId: this.actionParams.id,
            isTemplate: false,
            editTitle: true,
          });
          break;
        case "routeToFatherTasksTable":
          this.$router.push("/tasks");
          break;
        case "routeToTasksMap":
        this.$router.push("/map");
        break;
        case "routeToTemplateTable":
          this.$router.push("/work-templates");
          break;
        case "routeToScheduleTasks":
          this.$router.push("/schedule-tasks");
          break;
        case "routeToReportsView":
          this.$router.push("/reports");
          break;
        case "routeToGantt":
          this.$router.push("/gantt");
          break;
        default:
          this.$router.push("/calander");
      }
    },
    onlogin: function () {
      this.$refs.form.validate();
      if (this.valid) {
        this.login({ userName: this.userName, password: this.password }).then(
          (response) => {
            this.afterLogin();
          }
        );
      }
    },
  },
  props: {
    action: String,
    actionParams: Object,
  },
  mounted: async function () {
    console.log(this.$refs.user) 
    this.$refs.user.blur()
    this.$refs.passanur.blur();;
  },
  beforeRouteEnter(to, from, next) {
    next((vm) => {
      let configPath;
      if (process.env.NODE_ENV === "development") {
        configPath = "./config.json";
      } else {
        configPath = "attachments/config.json";
      }
      axios.get(configPath).then((response) => {
        vm.$store.commit("SET_CONFIG", response.data);
        api.defaults.baseURL = response.data.API_BASE_URL;
        if (document.cookie.indexOf("sid") != -1) {
          vm.loadUserData().then((response) => {
            vm.afterLogin();
          });
        } else {
          let message;
          switch (vm.action) {
            case "openFault":
              message = "אנא התחבר בכדי לצפות בתקלה";
              vm.$store.dispatch("snackbar/setSnackbar", {
                color: "green",
                text: message,
                timeout: 8000,
              });
              break;
            default:
              //if user session as timed out when dialog was open
              vm.$root.$emit("close-father-task-dialog");
          }
        }
      });
    });
  },
};
</script>
