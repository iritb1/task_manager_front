import store from "../index";
import { api } from "../../apiConfig";
import { tr } from "date-fns/locale";
// import taskCard from "../../components/taskCard";

function parseTask(task) {
  //Conver ISOFORMAT strings to javascript date
  // let decreaseTimeZoneDiff = taskCard.methods.decreaseTimeZoneDiff;
  if (task.start !== null) {
    task.start = new Date(task.start);
  }
  if (task.end !== null) {
    task.end = new Date(task.end);
  }

  //Calc if user as permissions to schedule and staff task
  task.editable = false;
  let userData = store.state.userData;
  if (userData.permissions.includes("ADMIN")) {
    task.editable = true;
  }
  if (userData.permissions.includes("LEAD")) {
    if (
      userData.domain_id == task.domain_id ||
      task.domain_id == store.state.config.OUT_SRC_DOMAIN_ID
    ) {
      task.editable = true;
    }
  }

  //calc if allDay is True or False
  // let allDay = false;
  // if (task.start !== null && task.end !== null) {
  //   if (
  //     task.start.getMinutes() == 0 &&
  //     decreaseTimeZoneDiff(task.start).getHours() == 0 &&
  //     task.end.getMinutes() == 0 &&
  //     decreaseTimeZoneDiff(task.end).getHours() == 0
  //   ) {
  //     allDay = true;
  //   }
  // }
  // task.allDay = allDay;
  //Calc if Deadline has passed and tak needs to be red.
  // if (task.deadline != null) {
  //   let deadline = decreaseTimeZoneDiff(new Date(task.deadline));
  //   if (deadline < new Date()) {
  //     task.color = "red";
  //   }
  // }
  return task;
}

const state = {
  tasks: [],
  fatherTasks: [],
  filters: { domains: [], staff: [], searchMode: 1 },
  tasksDisplayMode: 1,
  checkedSidebarFatherTasks: [],
};

const getters = {
  allTasks: (state) => state.tasks,
  getTask: (state) => (id) => state.tasks.find((task) => task.id == id),
  getFatherTask: (state) => (id) =>
    state.fatherTasks.find((fatherTask) => fatherTask.id == id),
  getFatherTaskTitle: (state) => (id) => {
    try {
      return state.fatherTasks.find((fatherTask) => fatherTask.id == id).title;
    } catch (err) {
      return "יתום";
    }
  },
  getFatherTaskWithChilds: (state) => (father_id) => {
    let fatherTask = state.fatherTasks.find(
      (fatherTask) => fatherTask.id == father_id
    );
    if (fatherTask == undefined) {
      return undefined;
    }
    let tasks = state.tasks
      .filter((task) => task.father_id == father_id)
      .sort(function(a, b) {
        // Turn your strings into dates, and then subtract them
        // to get a value that is either negative, positive, or zero.
        // return new Date(a.start) - new Date(b.start);
        return a.priority - b.priority;
      });
    return { fatherTask, tasks };
  },
  getFatherTasksWithChilds: (state) => {
    return state.fatherTasks
      .map((fatherTask) => {
        let tasks = state.tasks
          .filter((task) => task.father_id == fatherTask.id)
          .sort(function(a, b) {
            // Turn your strings into dates, and then subtract them
            // to get a value that is either negative, positive, or zero.
            return new Date(a.start) - new Date(b.start);
          });
        return { fatherTask, tasks };
      })
      .filter((fatherTaskObj) => fatherTaskObj.tasks.length > 0);
  },
  /**
   * get all task after filters
   */
  filterTasks: (state, getters, rootState) => {
    //filter buy domain
    let tasksAfterDomainFilter = state.tasks.filter((task) =>
      state.filters.domains.includes(task.domain_id)
    );
    //search by staff names
    if (state.filters.staff.length == 0) {
      return tasksAfterDomainFilter;
    } else {
      //if names are inserted to names search field.
      if (state.filters.searchMode == 1) {
        // If search mode is or
        return tasksAfterDomainFilter.filter((task) =>
          state.filters.staff.some((SearchEntity) => {
            if (SearchEntity.startsWith("GRP")) {
              return task.crew.some((taskEntity) => {
                if (taskEntity.startsWith("GRP")) {
                  return taskEntity == SearchEntity;
                } else {
                  return false;
                }
              });
            } else {
              // return task.crew.includes(SearchEntity);
              return task.crew.some((taskEntity) => {
                if (taskEntity.startsWith("GRP")) {
                  return (
                    getters["metadata/getStaffById"](SearchEntity).team_id ==
                    taskEntity
                  );
                } else {
                  return taskEntity == SearchEntity;
                }
              });
            }
          })
        );
      } else {
        // If search mode is and
        return tasksAfterDomainFilter.filter((task) =>
          state.filters.staff.reduce((accumulator, SearchEntity) => {
            if (SearchEntity.startsWith("GRP")) {
              return accumulator && task.crew.includes(SearchEntity);
            } else {
              return (
                task.crew.some((taskEntity) => {
                  if (taskEntity.startsWith("GRP")) {
                    return (
                      getters["metadata/getStaffById"](SearchEntity).team_id ==
                      taskEntity
                    );
                  } else {
                    return taskEntity == SearchEntity;
                  }
                }) && accumulator
              );
            }
          }, true)
        );
      }
    }
  },
  GetUnscheduleTasks: (state, getters) =>
    getters.filterTasks.filter((task) => task.start == null),
  filters: (state) => state.filters,
  getSearchMode: (state) => state.filters.searchMode,
};

const actions = {
  fetchUsersTasks({ commit, dispatch, rootState }) {
    let response;
    // response = axios.get(api_base_url + `task/user/${rootState.userData.uid}`, {
    return api.get("task/all").then(
      (response) => {
        response.data.map((task) => {
          task = parseTask(task);
        });
        commit("setTasks", response.data);
        return true;
      },
      (error) => {
        if (!(error.response && [401, 403].includes(error.response.status))) {
          dispatch("snackbar/setSnackbar", {
            text: `ארעה שגיאה בטעינת משימות מהשרת`,
            // timeout: -1,
            color: "red",
          });
        }
        return false;
      }
    );
  },
  fetchUsersFatherTasks({ commit, dispatch, rootState }) {
    return api.get("father-task/all").then(
      (response) => {
        commit("SET_FATHER_TASKS", response.data);
        return true;
      },
      (error) => {
        if (!(error.response && [401, 403].includes(error.response.status))) {
          dispatch("snackbar/setSnackbar", {
            text: `ארעה שגיאה בטעינת משימות אב מהשרת`,
            // timeout: -1,
            color: "red",
          });
        }
        return false;
      }
    );
  },
  updateFatherTask({ commit, dispatch }, updFatherTask) {
    return api.put("father-task", updFatherTask).then(
      (response) => {
        let message;
        if (updFatherTask.is_template) {
          commit("tasksTemplates/UPDATE_TEMPLATE_FATHER_TASK", response.data);
          message = `שבלונת משימת אב @ עודכנה בהצלחה`;
        } else {
          commit("UPDATE_FATHER_TASK", response.data);
          message = `משימת אב @ עודכנה בהצלחה`;
        }
        dispatch("snackbar/setSnackbar", {
          text: message,
          param: updFatherTask.title,
        });
        return Promise.resolve(response.data);
      },
      (error) => {
        if (!(error.response && [401, 403].includes(error.response.status))) {
          let message;
          if (updFatherTask.is_template) {
            message = `אירעה שגיאה בעדכון שבלונת משימת האב`;
          } else {
            message = `אירעה שגיאה בעדכון משימת האב`;
          }
          dispatch("snackbar/setSnackbar", {
            color: "red",
            text: message,
            param: updFatherTask.title,
          });
        }
        return Promise.reject(error);
      }
    );
  },
  /**
     * update fatherTask status and completed date (if necessary) when one of its child tasks changes status
     *
     
     * @param {fatherTask} object - fatherTask to update
     */
  updateFatherTaskStatus({ commit, dispatch }, oldFatherTask) {
    return api.put("father-task/status/updated", oldFatherTask).then(
      (response) => {
        if (response.data.updated) {
          commit("UPDATE_FATHER_TASK", response.data.father_task);
        }
        let data = JSON.parse(JSON.stringify(response.data))
        return Promise.resolve(data);
      },
      (error) => {
        if (!(error.response && [401, 403].includes(error.response.status))) {
          dispatch("snackbar/setSnackbar", {
            color: "red",
            text: "אירעה שגיאה בעדכון סטטוס משימת האב ",
            param: oldFatherTask.title,
          });
        }
        return Promise.reject(error);
      }
    );
  },
  updateTaskAsync({ commit, dispatch }, updTask) {
    if (Date.parse(updTask.deadline) < updTask.end) {
      dispatch("snackbar/setSnackbar", {
        color: "red",
        text: "לא ניתן לשבץ את משימה @ בתאריך המבוקש, תאריך סיום אחרי דדליין",
        param: updTask.title,
      });
      return;
    }
    return api.put("task", updTask).then(
      (response) => {
        response.data = parseTask(response.data);
        let message;
        if (updTask.is_template) {
          commit("tasksTemplates/UPDATE_TEMPLATE_TASK", response.data);
          message = `שבלומת משימה @ עודכנה בהצלחה`;
        } else {
          commit("updateTask", response.data);
          message = `משימה @ עודכנה בהצלחה`;
        }
        dispatch("snackbar/setSnackbar", {
          text: message,
          param: updTask.title,
        });
        return response.data;
      },
      (error) => {
        let message;
        let timeout = 3000;
        if (error.response) {
          if ([401, 403].includes(error.response.status)) {
            return Promise.reject(error);
          } else if (error.response.status == 404) {
            if (!updTask.is_template) {
              message = `משימה @ נמחקה ע''י משתמש אחר`;
            } else {
              message = `שבלונה @ נמחקה ע''י משתמש אחר`;
            }
            timeout = -1;
          }
          else if (updTask.is_template) {
            message = `אירעה שגיאה בעדכון שבלונת המשימה`;
          } else {
            message = `אירעה שגיאה בעדכון המשימה `;
          }
        } else if (updTask.is_template) {
          message = `אירעה שגיאה בעדכון שבלונת המשימה`;
        } else {
          message = `אירעה שגיאה בעדכון המשימה `;
        }
        dispatch("snackbar/setSnackbar", {
          color: "red",
          text: message,
          param: updTask.title,
          timeout: timeout,
        });

        return Promise.reject(error);
      }
    );
  },
  /**
   *updating task without waiting to request (for calander dragging event), if request fails revert the action.
   *
   * @param {*} { commit, dispatch }
   * @param {*} { task, updTask }
   * @return {*}  promise:if succeeed: reslove with updtask object else - reject with server error.
   */
  updateTaskSync({ commit, dispatch }, { task, updTask }) {
    if (Date.parse(updTask.deadline) < updTask.end) {
      dispatch("snackbar/setSnackbar", {
        color: "red",
        text: "לא ניתן לשבץ את משימה @ בתאריך המבוקש, זמן סיום אחרי דדליין",
        param: updTask.title,
      });
      return;
    }
    commit("updateTask", updTask);
    return api.put("task", updTask).then(
      (response) => {
        dispatch("snackbar/setSnackbar", {
          text: `משימה @ עודכנה בהצלחה`,
          param: updTask.title,
        });
        return response.data;
      },
      (error) => {
        // commit("updateTask", task);
        // if (!(error.response && [401, 403].includes(error.response.status))) {
        //   let message;
        //   if (updTask.is_template) {
        //     message = `אירעה שגיאה בעדכון שבלונת המשימה`;
        //   } else {
        //     message = `אירעה שגיאה בעדכון המשימה `;
        //   }
        //   dispatch("snackbar/setSnackbar", {
        //     color: "red",
        //     text: message,
        //     param: updTask.title,
        //   });
        // }
        // return Promise.reject(error);


        commit("updateTask", task);
        let message;
        let timeout = 3000;
        if (error.response) {
          if ([401, 403].includes(error.response.status)) {
            return Promise.reject(error);
          } else if (error.response.status == 404) {
            commit("deleteTask", task.id);
            if (!updTask.is_template) {
              message = `משימה @ נמחקה ע''י משתמש אחר`;
            } else {
              message = `שבלונה @ נמחקה ע''י משתמש אחר`;
            }
            timeout = -1;
          }
          else if (updTask.is_template) {
            message = `אירעה שגיאה בעדכון שבלונת המשימה`;
          } else {
            message = `אירעה שגיאה בעדכון המשימה `;
          }
        } else if (updTask.is_template) {
          message = `אירעה שגיאה בעדכון שבלונת המשימה`;
        } else {
          message = `אירעה שגיאה בעדכון המשימה `;
        }
        dispatch("snackbar/setSnackbar", {
          color: "red",
          text: message,
          param: updTask.title,
          timeout: timeout,
        });

        return Promise.reject(error);
      }
    );
  },
  createFatherTask({ commit, dispatch }, FatherTask) {
    return api.post("father-task", FatherTask).then(
      (response) => {
        let message;
        if (FatherTask.is_template) {
          commit("tasksTemplates/APPEND_TEMPLATE_FATHER_TASK", response.data);
          message = `שבלונת משימת אב @ נוצרה בהצלחה`;
        } else {
          commit("APPEND_FATHER_TASK", response.data);
          message = `משימת אב @ נוצרה בהצלחה`;
        }
        dispatch("snackbar/setSnackbar", {
          text: message,
          param: FatherTask.title,
        });
        return response.data;
      },
      (error) => {
        if (!(error.response && [401, 403].includes(error.response.status))) {
          let message = "";
          if (FatherTask.is_template) {
            message = `אירעה שגיאה ביצירת שבלונת משימת האב`;
          } else {
            message = `אירעה שגיאה ביצירת משימת האב `;
          }
          dispatch("snackbar/setSnackbar", {
            color: "red",
            text: message,
            param: FatherTask.title,
          });
        }
        return Promise.reject(error);
      }
    );
  },
  createTask({ commit, dispatch }, task) {
    return api.post("task", task).then(
      (response) => {
        response.data = parseTask(response.data);
        let message;
        if (task.is_template) {
          commit("tasksTemplates/APPEND_TEMPLATE_TASK", response.data);
          message = `שבלונת משימה @ נוצרה בהצלחה`;
        } else {
          commit("appendTask", response.data);
          message = `משימה @ נוצרה בהצלחה`;
        }
        dispatch("snackbar/setSnackbar", {
          text: message,
          param: task.title,
        });
        return response.data;
      },
      (error) => {
        if (!(error.response && [401, 403].includes(error.response.status))) {
          let message = "";
          if (task.is_template) {
            message = `אירעה שגיאה ביצירת שבלונת המשימה `;
          } else {
            message = `אירעה שגיאה ביצירת המשימה `;
          }
          dispatch("snackbar/setSnackbar", {
            color: "red",
            text: message,
            param: task.title,
          });
        }
        return Promise.reject(error);
      }
    );
  },
  deleteTask({ commit, dispatch }, delTask) {
    // return axios.delete(api_base_url + `task/${delTask.id}`).then(
    return api.delete(`task/${delTask.id}`).then(
      (response) => {
        let message;
        if (delTask.is_template) {
          commit("tasksTemplates/DEL_TEMPLATE_TASK", delTask);
          message = `שבלונת המשימה @ נמחקה בהצלחה`;
        } else {
          commit("deleteTask", delTask.id);
          message = `משימה @ נמחקה בהצלחה`;
        }
        dispatch("snackbar/setSnackbar", {
          text: message,
          param: delTask.title,
        });
        return Promise.resolve();
      },
      (error) => {
        if (error.response){
            if([401, 403].includes(error.response.status)){
              return Promise.reject(error);
            }
            else if (error.response.status == 404){
              return Promise.resolve();
            }
        }
        let message;
        if (delTask.is_template) {
          message = `אירעה שגיאה במחיקת שבלונת המשימה `;
        } else {
          message = `אירעה שגיאה במחיקת המשימה `;
        }
        dispatch("snackbar/setSnackbar", {
          color: "red",
          text: message,
          param: delTask.title,
        });
      return Promise.reject(error);
      
    //     if (!(error.response && [401, 403].includes(error.response.status))) {
    //       let message;
    //       if (delTask.is_template) {
    //         message = `אירעה שגיאה במחיקת שבלונת המשימה `;
    //       } else {
    //         message = `אירעה שגיאה במחיקת המשימה `;
    //       }
    //       dispatch("snackbar/setSnackbar", {
    //         color: "red",
    //         text: message,
    //         param: delTask.title,
    //       });
    //     }
    //     return Promise.reject(error);
    //   }
    // );
    })
  },
  setUncheckedFatherTask({ commit, state }, fatherId) {
    if (state.checkedSidebarFatherTasks.includes(fatherId)) {
      commit(
        "SET_UNCHECKED_SIDEBAR_FATHERTASKS",
        state.checkedSidebarFatherTasks.filter((id) => id != fatherId)
      );
    } else {
      commit(
        "SET_UNCHECKED_SIDEBAR_FATHERTASKS",
        state.checkedSidebarFatherTasks.concat([fatherId])
      );
    }
  },
};

const mutations = {
  setTasks: (state, tasks) => (state.tasks = tasks),
  SET_FATHER_TASKS: (state, fatherTasks) => (state.fatherTasks = fatherTasks),
  SET_FATHER_TASK_STATUS: (state, payload) => {
    const index = state.fatherTasks.findIndex(
      (fatherTask) => fatherTask.id === payload.id
    );
    if (index !== -1) {
      state.fatherTasks[index].status_id = payload.status_id;
    }
  },
  UPDATE_FATHER_TASK: (state, updFatherTask) => {
    const index = state.fatherTasks.findIndex(
      (fatherTask) => fatherTask.id === updFatherTask.id
    );
    if (index !== -1) {
      state.fatherTasks.splice(index, 1, updFatherTask);
    }
  },
  updateTask: (state, updateTask) => {
    const index = state.tasks.findIndex((task) => task.id === updateTask.id);
    if (index !== -1) {
      state.tasks.splice(index, 1, updateTask);
    }
  },
  appendTask: (state, task) => state.tasks.push(task),
  APPEND_FATHER_TASK: (state, fatherTask) => state.fatherTasks.push(fatherTask),
  deleteTask: (state, id) =>
    (state.tasks = state.tasks.filter((task) => task.id !== id)),
  setFilters: (state, payload) => {
    for (const filter in payload) {
      state.filters[filter] = payload[filter];
    }
  },
  setTasksDisplayMode: (state, mode) => (state.tasksDisplayMode = mode),
  SET_UNCHECKED_SIDEBAR_FATHERTASKS: (state, value) =>
    (state.checkedSidebarFatherTasks = value),
};

export default {
  state,
  actions,
  getters,
  mutations,
};
