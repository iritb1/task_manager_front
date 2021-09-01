import { api } from "../../apiConfig";

const state = {
  domains: [],
  taskTypes: [],
  urgencies: [],
  statuses: [{}, {}, {}, {}],
  staff: [],
  domainsDict: {},
  taskTypesDict: {},
  urgenciesDict: {},
  statusesDict: {},
  staffDict: {},
  plannings:[],
  persons:[]


};

const getters = {
  domains: (state) => state.domains,
  taskTypes: (state) => state.taskTypes,
  urgencies: (state) => state.urgencies,
  statuses: (state) => state.statuses,
  allStaff: (state) => state.staff,
  getStaffById:(state) =>(id) => state.staff.find(entity=>entity.id == id),
  allStaffByDomains: (state, getters) => {
    let result = [];
    state.domains.forEach((domain) => {
      const domainStaff = getters.domainStaff(domain.id);
      if (domainStaff.length > 0) {
        result.push({ header: domain.name });
        result = result.concat(domainStaff);
        result.push({ divider: true });
      }
    });

    return result;
  },
  domainsDict: (state) => state.domainsDict,
  taskTypesDict: (state) => state.taskTypesDict,
  urgenciesDict: (state) => state.urgenciesDict,
  statusesDict: (state) => state.statusesDict,
  allStaffDict: (state) => state.staffDict,
  domainStaff: (state) => (domain_id) => {
    return state.staff.filter((entity) => entity.domain_id == domain_id);
  },
};

const actions = {
  async fetchMetadata({ commit, dispatch }) {
    try {
      const domainsResponse = api.get("metadata/domains");
      const taskTypesNamesResponse = api.get("metadata/task-types");
      const urgenciesResponse = api.get("metadata/urgencies");
      const statusesResponse = api.get("metadata/statuses");
      const staffResponse = api.get("metadata/staff/all");
      const planningsResponse = api.get("metadata/plannings/all");
      const personsResponse = api.get("metadata/person/all");

      const domains = await domainsResponse;
      const taskTypes = await taskTypesNamesResponse;
      const urgencies = await urgenciesResponse;
      const statuses = await statusesResponse;
      const staff = await staffResponse;
      const plannings = await planningsResponse;
      const persons = await personsResponse;

      commit("setDomains", domains.data);
      commit("setTaskTypes", taskTypes.data);
      commit("setUrgencies", urgencies.data);
      commit("setStatuses", statuses.data);
      commit("setStaff", staff.data);
      commit("SET_PROP", {prop_name:'plannings',prop_value:plannings.data});          
      commit("SET_PROP", {prop_name:'persons',prop_value:persons.data});
      return Promise.resolve();
    } catch (error) {
      dispatch(
        "snackbar/setSnackbar",
        {
          timeout: -1,
          color: "red",
          text: "אירעה שגיעה בטעינת מטא דאטה, טען מחדש את העמוד",
        },
        { root: true }
      );
      return Promise.reject();
    }
  },
  setUsersFilters({ state, rootState, commit, dispatch }) {
    const userData = rootState.userData;
    if (userData.permissions == "ADMIN") {
      commit(
        "setFilters",
        {
          domains: state.domains.map((obj) => obj.id),
        },
        { root: true }
      );
    } else {
      commit(
        "setFilters",
        {
          domains: [userData.domain_id],
        },
        { root: true }
      );
    }
  },
};

const mutations = {
  setDomains: (state, domains) => {
    state.domains = domains;
    for (var index in domains) {
      state.domainsDict[domains[index]["id"]] = domains[index]["name"];
    }
  },
  setTaskTypes: (state, taskTypes) => {
    state.taskTypes = taskTypes;
    for (var index in taskTypes) {
      state.taskTypesDict[taskTypes[index]["id"]] = taskTypes[index]["name"];
    }
  },
  setUrgencies: (state, urgencies) => {
    state.urgencies = urgencies;
    for (var index in urgencies) {
      state.urgenciesDict[urgencies[index]["id"]] = urgencies[index]["name"];
    }
  },
  setStatuses: (state, statuses) => {
    state.statuses = statuses;
    for (var index in statuses) {
      state.statusesDict[statuses[index]["id"]] = statuses[index]["name"];
    }
  },
  setStaff: (state, staff) => {
    state.staff = staff;
    for (var index in staff) {
      state.staffDict[staff[index]["id"]] =
        staff[index]["name"]
    }
  },
  SET_PROP: (state, payload) => {
    state[payload.prop_name] = payload.prop_value;
  },
};

export default {
  namespaced: true,
  state,
  actions,
  getters,
  mutations,
};
