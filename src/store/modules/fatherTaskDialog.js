// import axios from "axios";
// import { api_base_url } from "../../config";

// const state = {
//   toShow: false,
//   // type: "current",
//   data: null,
//   // currentFatherTaskID: null,
//   isLoad: false,
// };

// const getters = {
//   toShow: (state) => state.toShow,
//   // type: (state) => state.type,
//   isLoad: (state) => state.isLoad,
//   data: (state) => state.data,
// };

// const actions = {
//   onTaskClick({ commit }, fatherTaskID) {
//     commit("setIsLoad", false);
//     commit("show");
//     axios.get(api_base_url + `father-task/with-childs/${fatherTaskID}`).then(
//       (response) => {
//         commit("setIsLoad", true);
//         commit("setData", response);
//       },
//       (error) => {
//         commit("hide");
//         window.alert(error);
//       }
//     );
//   },
// };

// const mutations = {
//   show: (state) => (state.toShow = true),
//   hide: (state) => (state.toShow = false),
//   setIsLoad: (state, status) => (state.isLoad = status),
//   // setCurrnetID: (state, id) => (state.currentFatherTaskID = id),
//   setData: (state, response) => (state.data = response.data),
// };

// export default {
//   namespaced: true,
//   state,
//   actions,
//   getters,
//   mutations,
// };
