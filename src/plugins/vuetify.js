import Vue from "vue";
import Vuetify from "vuetify/lib";
import DatetimePicker from "vuetify-datetime-picker";
import he from "vuetify/es5/locale/he";
import "@mdi/font/css/materialdesignicons.css";

Vue.use(Vuetify);
Vue.use(DatetimePicker);

export default new Vuetify({
  rtl: true,
  icons: {
    // iconfont: "mdiSvg", // 'mdi' || 'mdiSvg' || 'md' || 'fa' || 'fa4' || 'faSvg'
    iconfont: "mdi",
  },
  locales: { he },
  current: "he",
});
