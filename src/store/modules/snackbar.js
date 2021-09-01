export default {
  namespaced: true,
  state: {
    snackbars: [],
  },
  mutations: {
    SET_SNACKBAR(state, snackbar) {
      state.snackbars = state.snackbars.concat(snackbar);
    },
    REMOVE_SNACKBAR(state, snackbar) {
      snackbar.showing = false;
    },
  },
  actions: {
    setSnackbar({ commit }, snackbar) {
      snackbar.showing = true;
      snackbar.color = snackbar.color || "success";
      if (snackbar.timeout == undefined) {
        snackbar.timeout = 3000;
      }
      snackbar.key = snackbar.text + Math.random();
      commit("SET_SNACKBAR", snackbar);
    },
    removeSnackbar({ commit }, snackbar) {
      commit("REMOVE_SNACKBAR", snackbar);
    },
  },
  getters: {
    showinSnackbars: (state) => {
      return state.snackbars.filter((s) => s.showing);
    },
  },
  modules: {},
};
