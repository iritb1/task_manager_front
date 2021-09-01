import Vue from "vue";
import Vuex from "vuex";
import tasks from "./modules/tasks";
import metadata from "./modules/metadata";
import snackbar from "./modules/snackbar";
import userData from "./modules/userData";
import tasksTemplates from "./modules/tasksTemplates";
import tasksSchedulers from "./modules/tasksSchedulers";

Vue.use(Vuex);

export default new Vuex.Store({
  strict: true,
  state: { loading: false, config:{} },
  mutations: {
    SET_LOADING: (state, value) => (state.loading = value),
    SET_CONFIG: (state, value) => (state.config = value),
  },
  actions: {},
  modules: {
    tasks,
    metadata,
    snackbar,
    userData,
    tasksTemplates,
    tasksSchedulers,
  },
});
