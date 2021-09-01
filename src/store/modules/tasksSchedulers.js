import { api } from "../../apiConfig";

const state = {
  schedulers: [],
  fetched: false,
};

const getters = {
  allFullSchedulers: (state, getters, rootState, rootGetters) => {
    return state.schedulers.map((scheduler) => {
      const template = rootGetters["tasksTemplates/getTemplateByFatherId"](
        scheduler.template_father_task_id
      );
      return {
        scheduler: scheduler,
        fatherTask: template.fatherTask,
        tasks: template.tasks,
      };
    });
  },
  getScheduler: (state, getters, rootState, rootGetters) => (id) =>
    state.schedulers.find((scheduler) => scheduler.id == id),
};

const actions = {
  fetchAllTaskSchedulers({ commit, dispatch }) {
    return api
      .get("task-scheduler/all")
      .then((response) => {
        commit("SET_SCHEDULERS", response.data);
        commit("SET_FETCHED", true);
        return Promise.resolve();
      })
      .catch((error) => {
        if (!(error.response && [401, 403].includes(error.response.status))) {
        dispatch(
          "snackbar/setSnackbar",
          {
            text: `ארעה שגיאה בטעינת תזמוני משימות מהשרת מהשרת, אנא נסה שנית`,
            // timeout: -1,
            color: "red",
          },
          { root: true }
        );
        return Promise.reject();
       }});
  },
  createScheduler({ commit, dispatch, rootGetters }, scheduler) {
    return api
      .post("task-scheduler", scheduler)
      .then((response) => {
        commit("ADD_SCHEDULER", response.data);
        dispatch(
          "snackbar/setSnackbar",
          {
            text: "תזמון מספר @ נוצר בהצלחה",
            param: response.data.id,
          },
          { root: true }
        );
        return response.data;
      })
      .catch((error) => {
        if (!(error.response && [401, 403].includes(error.response.status))) {
          dispatch(
            "snackbar/setSnackbar",
            {
              color: "red",
              text: "יצירת התזמון נכשלה",
            },
            { root: true }
          );
          return false;
        }
        return false;
      });
  },
  updateScheduler({ commit, dispatch }, updScheduler) {
    return api
      .put("task-scheduler", updScheduler)
      .then((response) => {
        commit("UPDATE_SCHEDULER", response.data);
        dispatch(
          "snackbar/setSnackbar",
          {
            text: "תזמון מספר @ עודכן בהצלחה",
            param: updScheduler.id,
          },
          { root: true }
        );
        return response.data;
      })
      .catch((error) => {
        if (!(error.response && [401, 403].includes(error.response.status))) {
          dispatch(
            "snackbar/setSnackbar",
            {
              color: "red",
              text: "עדכון התזמון @ נכשל",
              param: updScheduler.id,
            },
            { root: true }
          );
          return false;
        }
        return Promise.reject(error);
      });
  },
  deleteScheduler({ commit, dispatch }, delScheduler) {
    return api.delete(`task-scheduler/${delScheduler.id}`).then(
      (response) => {
        commit("DELETE_SCHEDULER", delScheduler.id);
        dispatch("snackbar/setSnackbar", {
          text: `המתזמן מספר @ נמחקה בהצלחה`,
          param: delScheduler.id,
        },{root:true});
        return true;
      },
      (error) => {
        if (!(error.response && [401, 403].includes(error.response.status))) {
          dispatch("snackbar/setSnackbar", {
            color: "red",
            text: `אירעה שגיאה במחיקת המתזמן מספר `,
            param: delScheduler.id,
          },{root:true});
        }
        return Promise.reject(error);
      }
    );
  },
};

const mutations = {
  SET_SCHEDULERS: (state, schedulers) => (state.schedulers = schedulers),
  ADD_SCHEDULER: (state, scheduler) => state.schedulers.push(scheduler),
  SET_FETCHED: (state, value) => (state.fetched = value),
  UPDATE_SCHEDULER: (state, updScheduler) => {
    const index = state.schedulers.findIndex(
      (scheduler) => scheduler.id === updScheduler.id
    );
    if (index !== -1) {
      state.schedulers.splice(index, 1, updScheduler);
    }
  },
  DELETE_SCHEDULER: (state, id) => {
    state.schedulers = state.schedulers.filter(
      (scheduler) => scheduler.id != id
    );
  },
};

export default {
  namespaced: true,
  state,
  actions,
  getters,
  mutations,
};
