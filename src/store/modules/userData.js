import axios from "axios";
import router from "../../router/index";
import { api } from "../../apiConfig";
export default {
  namespaced: true,
  state: {
    sid: null,
    uid: null,
    firstName: null,
    name: null,
    domain_id: null,
    permissions: null,
  },
  getters: {
    roleDescription: (state, getters, rootState) => {
      if (rootState.metadata.domains.length == 0) {
        return "טוען";
      }
      if (state.permissions.includes('ADMIN')) {
        return "מנהל מחלקה";
      }
      if (state.permissions.includes("LEAD")) {
        return (
          "מנהל " +
          rootState.metadata.domains.filter(
            (domain) => domain.id == state.domain_id
          )[0].name
        );
      }
      if (state.permissions.includes("MEMBER")) {
        return rootState.metadata.domains.filter(
          (domain) => domain.id == state.domain_id
        )[0].name;
      }
      return "עובד";
    },
    // username: (state) => state.username,
    // password: (state) => state.password,
    sid: (state) => state.sid,
    isLogedIn: (state) => (state.uid ? true : false),
  },

  actions: {
    login({ commit, dispatch, rootState }, payload) {
      commit("SET_LOADING", true, { root: true });
      
      return axios
        .post(rootState.config.API_BASE_URL + "login", payload, { withCredentials: true })
        .then((response) => response.data)
        .then((response) => {
          return dispatch("loadUserData", response.sid);
        })
        .catch(function(err) {
          
          let message;
          if (err.response && [401, 403,418].includes(err.response.status)) {
            message = err.response.data.error.message;
          } else {
            message = "אירעה שגיאה אנה נסה שנית";
          }
          dispatch(
            "snackbar/setSnackbar",
            {
              color: "red",
              text: message,
            },
            { root: true }
          );
          commit("SET_LOADING", false, { root: true });
          return Promise.reject();
        });
    },
    loadUserData({ commit, dispatch, state, rootState }, sid) {
      // let payload;
      // if (state.sid != null) {
      //   payload = { sid: state.sid };
      // }
      let headers = {};
      if (sid != undefined) {
        headers.AUTHORIZATION = "Bearer " + sid;
      }
      return axios
        .get(rootState.config.API_BASE_URL + "login/userData", {
          headers: headers,
          withCredentials: true,
        })
        .then((response) => response.data)
        .then(async (response) => {
          dispatch(
            "snackbar/setSnackbar",
            {
              color: "green",
              text: `ברוך הבא `,
              param: response.name
            },
            { root: true }
          );
          commit("SET_LOADING", true, { root: true });
          api.defaults.headers.common["Authorization"] =
            "Bearer " + response.sid;
          commit("SET_USER", response);
          await Promise.allSettled([
            dispatch("metadata/fetchMetadata", {}, { root: true }),
            dispatch("fetchUsersTasks", {}, { root: true }),
            dispatch("fetchUsersFatherTasks", {}, { root: true }),
            dispatch("tasksTemplates/fetchAlltemplates", {}, { root: true }),
            // dispatch("tasksSchedulers/fetchAllTaskSchedulers", {}, { root: true }),
          ]);
          dispatch("metadata/setUsersFilters", {}, { root: true });
          commit("SET_LOADING", false, { root: true });
          return Promise.resolve();
        })
        .catch(function(err) {
          commit("SET_LOADING", false, { root: true });
       
          let message;
          if (err.response && [401, 403, 418].includes(err.response.status)) {
            message = err.response.data.error.message;
            document.cookie =
            "sid=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;";
          }
          
           else if (err.response)  {
            document.cookie =
            "sid=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;";
            message = "אירעה שגיאה אנה נסה שנית";
          
          dispatch(
            "snackbar/setSnackbar",
            {
              color: "red",
              text: message,
            },
            { root: true }
          );
           }
          return Promise.reject();
        });
    },
    logOut({ commit }) {
      router.push("/login");
      // localStorage.clear();
      document.cookie = "sid=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;";
      commit("setTasks", [], { root: true });
      commit("SET_USER", {
        sid: null,
        uid: null,
        domain_id: null,
        lastName: null,
        firstName: null,
        permissions: null,
      });
    },
  },
  mutations: {
    SET_SID: (state, sid) => {
      state.sid = sid;
    },
    SET_USER: (state, payload) => {
      // localStorage.setItem("sid", payload.sid);

      // state.uid = payload.id;
      // state.username = payload.username;
      // state.firstName = payload.first_name;
      // state.lastName = payload.last_name;
      // state.permissions = payload.permissions;
      // state.domain_id = payload.domain_id;
      state.sid = payload.sid;
      state.uid = payload.id;
      state.domain_id = payload.domain_id;
      state.firstName = payload.first_name;
      state.name = payload.name;
      state.permissions = payload.permissions;
    },
  },
  modules: {},
};
