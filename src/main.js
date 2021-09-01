import Vue from "vue";
import App from "./App.vue";
import router from "./router";
import store from "./store";
import vuetify from "./plugins/vuetify";
import VueConfirmDialog from "vue-confirm-dialog";
import { ValidationProvider } from "vee-validate";
import VTooltip from "v-tooltip";
import VueTippy, { TippyComponent } from "vue-tippy";
import { api } from "./apiConfig";
import "material-design-icons-iconfont/dist/material-design-icons.css";
import Vuetify from "vuetify";

import VueFusionCharts from 'vue-fusioncharts';
import FusionCharts from 'fusioncharts';
import Charts from 'fusioncharts/fusioncharts.charts';
import Gantt from "fusioncharts/fusioncharts.gantt";
import FusionTheme from 'fusioncharts/themes/fusioncharts.theme.fusion';

Vue.use(VueFusionCharts, FusionCharts, Charts, Gantt, FusionTheme);
Vue.use(VueTippy);
Vue.use(Vuetify, {
  iconfont: "md",
});
Vue.use(VTooltip);
Vue.config.productionTip = false;
Vue.use(VueConfirmDialog);
Vue.component("vue-confirm-dialog", VueConfirmDialog.default);
Vue.component("ValidationProvider", ValidationProvider);
Vue.component("tippy", TippyComponent);

new Vue({
  router,
  store,
  vuetify,
  render: (h) => h(App),
}).$mount("#app");


Vue.mixin({
  methods: {
    Numberify(value) {
      return new Intl.NumberFormat().format(value);
    },
    addUts(url) {
      var uts = Date.now();
      if (url.includes('?')) {
        return url + '&uts=' + uts;
      }
      return url + '?uts=' + uts;
    },
    toINT(value) {
      let result = parseInt(value)
      return isNaN(result) ? 0 : result
    },
    entitySearch: (item, queryText, itemText) => {
      if ("team_name" in item) {
        return (
          (item.name + item.team_name)
            .toLocaleLowerCase()
            .indexOf(queryText.toLocaleLowerCase()) > -1
        );
      } else {
        return (
          itemText.toLocaleLowerCase().indexOf(queryText.toLocaleLowerCase()) >
          -1
        );
      }
    },
  }
});

api.interceptors.response.use(
  (response) => {
    if (response.status === 200 || response.status === 201) {
      return Promise.resolve(response);
    } else {
      return Promise.reject(response);
    }
  },
  (error) => {
    if (error.response.status) {
      switch (error.response.status) {
        case 401:
          store.dispatch(
            "snackbar/setSnackbar",
            {
              color: "red",
              text: "חיבור פג תוקף אנא התחבר שנית",
              timeout: 6000,
            },
            { root: true }
          );
          store.dispatch("userData/logOut");
          break;
        case 403:
          store.dispatch(
            "snackbar/setSnackbar",
            {
              color: "red",
              text: "אנא בצע הזדהות",
              timeout: 6000,
            },
            { root: true }
          );
          store.dispatch("userData/logOut");
          break;
        case 405:
          store.dispatch(
            "snackbar/setSnackbar",
            {
              color: "red",
              text: "לא מורשה לבצע את הפעולה",
              timeout: 5000,
            },
            { root: true }
          );
          break;
      }
      return Promise.reject(error);
    }
  }
);


String.prototype.formatUnicorn = String.prototype.formatUnicorn ||
  function () {
    "use strict";
    var str = this.toString();
    if (arguments.length) {
      var t = typeof arguments[0];
      var key;
      var args = ("string" === t || "number" === t) ?
        Array.prototype.slice.call(arguments)
        : arguments[0];

      for (key in args) {
        str = str.replace(new RegExp("\\{" + key + "\\}", "gi"), args[key]);
      }
    }

    return str;
  };