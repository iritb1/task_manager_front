import { api } from "../../apiConfig";
import store from "../index";

/**
 *
 *parsing task object fetched from server
 * @param {task} task object from server
 * @return {task} task object
 */
export function parseTemplateTask(task) {
  //Calc if user as permissions to schedule and staff task
  task.editable = false;
  let userData = store.state.userData;
  if (userData.permissions.includes("ADMIN")) {
    task.editable = true;
  }
  if (userData.permissions.includes("LEAD")) {
    if (userData.domain_id == task.domain_id) {
      task.editable = true;
    }
  }

  return task;
}

const state = {
  templates: {},
};

const getters = {
  allTemplates: (state) => state.templates,
  getTemplateByFatherId: (state) => (father_id) =>
    state.templates.find((template) => template.fatherTask.id == father_id),
  getTemplateFatherTask: (state) => (father_id, id) => {
    let template = state.templates.find(
      (template) => template.fatherTask.id == father_id
    );
    if (template) {
      return template.fatherTask;
    }
  },

  getTemplateTask: (state) => (father_id, id) => {
    let template = state.templates.find(
      (template) => template.fatherTask.id == father_id
    );
    if (template) {
      return template.tasks.find((task) => task.id == id);
    }
  },
};

const actions = {
  fetchAlltemplates({ commit, dispatch, rootState }) {
    return api
      .get("template/all")
      .then((response) => {
        response.data.forEach((template) => {
          template.tasks.forEach((task) => {
            task = parseTemplateTask(task);
          });
        });
        commit("SET_TEMPLATES", response.data);
        return true;
      })
      .catch((error) => {
        if (!(error.response && [401, 403].includes(error.response.status))) {
        dispatch(
          "snackbar/setSnackbar",
          {
            text: `ארעה שגיאה בטעינת שבלונות מהשרת מהשרת, אנא נסה שנית`,
            // timeout: -1,
            color: "red",
          },
          { root: true }
        );
        return false;
      }});
  },
  deleteTemplate({ state, rootState, commit, dispatch }, template) {
    const fatherId = template.fatherTask.id
    const templateSchedulers = rootState.tasksSchedulers.schedulers.filter(scheduler=> 
      scheduler.template_father_task_id == fatherId)
    if (templateSchedulers.length> 0){
      dispatch(
        "snackbar/setSnackbar",
        {
          color: "red",
          text: 'לא ניתן למחוק את שבלונה @, השבלונה מתוזמנת',
          param: template.fatherTask.title,
        },
        { root: true }
      );

      return false

    }
    // let template = state.templates.find(
    //   (template) => template.fatherTask.id == fatherId
    // );
    let responses = [];
    template.tasks.forEach((task) => {
      responses.push(dispatch("deleteTask", task, { root: true }));
    });
    return Promise.all(responses)
      .then((response) => {
        api
          .delete(`father-task/${fatherId}`)
          .then((response) => {
            dispatch(
              "snackbar/setSnackbar",
              {
                text: "שבלונה @ נמחקה בהצלחה",
                param: template.fatherTask.title,
              },
              { root: true }
            );
            commit("DELETE_TEMPLATE", fatherId);
            return true;
          })
          .catch((error) => {
            throw new Error("description");
          });
      })
      .catch((error) => {
        if (!(error.response && [401, 403].includes(error.response.status))) {
          let message;
          if (template.fatherTask.is_template) {
            message = `אירעה שגיאה במחיקת השבלונה `;
          }
          dispatch(
            "snackbar/setSnackbar",
            {
              color: "red",
              text: message,
              param: template.fatherTask.title,
            },
            { root: true }
          );

          return Promise.reject(error);
        }
      });
  },
};

const mutations = {
  SET_TEMPLATES: (state, templates) => (state.templates = templates),

  UPDATE_TEMPLATE_FATHER_TASK: (state, updFatherTask) => {
    const templateIndex = state.templates.findIndex(
      (template) => template.fatherTask.id === updFatherTask.id
    );
    if (templateIndex !== -1) {
      state.templates[templateIndex].fatherTask = updFatherTask;
    }
  },
  UPDATE_TEMPLATE_TASK: (state, updateTask) => {
    const templateIndex = state.templates.findIndex(
      (template) => template.fatherTask.id === updateTask.father_id
    );

    const taskIndex = state.templates[templateIndex].tasks.findIndex(
      (task) => (task.id = updateTask.id)
    );
    if (taskIndex !== -1) {
      state.templates[templateIndex].tasks.splice(taskIndex, 1, updateTask);
    }
  },
  APPEND_TEMPLATE_TASK: (state, task) => {
    const templateIndex = state.templates.findIndex(
      (template) => template.fatherTask.id === task.father_id
    );
    state.templates[templateIndex].tasks.push(task);
  },
  APPEND_TEMPLATE_FATHER_TASK: (state, fatherTask) =>
    state.templates.push({ fatherTask, tasks: [] }),
  DEL_TEMPLATE_TASK: (state, delTask) => {
    const templateIndex = state.templates.findIndex(
      (template) => template.fatherTask.id == delTask.father_id
    );
    state.templates[templateIndex].tasks = state.templates[
      templateIndex
    ].tasks.filter((task) => task.id != delTask.id);
  },
  DELETE_TEMPLATE: (state, fatherId) => {
    state.templates = state.templates.filter(
      (template) => template.fatherTask.id != fatherId
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
