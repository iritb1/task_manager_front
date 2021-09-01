import Vue from "vue";
import VueRouter from "vue-router";


import loginView from "../views/LoginView";
import calanderView from "../views/CalanderView";
const netcoolLoginView = () => import(/* webpackChunkName: "netcoolLoginView" */ "../views/netcoolLoginView")
const monitorFaultView = () => import(/* webpackChunkName: "monitorFaultView" */ "../views/MonitorFaultView")
const fatherTasksTabView = () => import(/* webpackChunkName: "fatherTasksTabView" */ "../views/FatherTasksTab")
const TasksMapTab = () => import(/* webpackChunkName: "fatherTasksTabView" */ "../views/TasksMapTab")
const workTemplatesView = () => import(/* webpackChunkName: "workTemplatesView" */ "../views/workTemplates")
const scheduleTasksView = () => import(/* webpackChunkName: "scheduleTasksView" */ "../views/ScheduleTasksView")
const reportsView = () => import(/* webpackChunkName: "reportsView" */ "../views/reportsView")
const GanttView = () => import(/* webpackChunkName: "GanttView" */ "../views/GanttView")


Vue.use(VueRouter);

const routes = [
  { path: "*", redirect: "/login" },
  {
    path: "/login",
    name: "login",
    component: loginView,
    props: true,
  },
  {
    path: "/netcool-login",
    name: "netcoolLogin",
    // route level code-splitting
    // this generates a separate chunk (about.[hash].js) for this route
    // which is lazy-loaded when the route is visited.
    component: netcoolLoginView,
  },
  {
    path: "/calander",
    name: "Calander",
    component: calanderView,
  },
  
  {
    path: "/tasks",
    name: "FatherTasksTab",
    // route level code-splitting
    // this generates a separate chunk (about.[hash].js) for this route
    // which is lazy-loaded when the route is visited.
    component: fatherTasksTabView,
  },
  {
    path: "/map",
    name: "TasksMapTab",
    // route level code-splitting
    // this generates a separate chunk (about.[hash].js) for this route
    // which is lazy-loaded when the route is visited.
    component: TasksMapTab,
  },
  {
    path: "/work-templates",
    name: "workTemplates",
    // route level code-splitting
    // this generates a separate chunk (about.[hash].js) for this route
    // which is lazy-loaded when the route is visited.
    component: workTemplatesView,
  },
  {
    path: "/schedule-tasks",
    name: "ScheduleTasks",
    // route level code-splitting
    // this generates a separate chunk (about.[hash].js) for this route
    // which is lazy-loaded when the route is visited.
    component: scheduleTasksView,
  },
  {
    path: "/monitor-fault/:id",
    name: "MonitorFaultView",
    // route level code-splitting
    // this generates a separate chunk (about.[hash].js) for this route
    // which is lazy-loaded when the route is visited.
    component: monitorFaultView,
  },
 
  {
    path: "/reports",
    name: "reportsView",
    // route level code-splitting
    // this generates a separate chunk (about.[hash].js) for this route
    // which is lazy-loaded when the route is visited.
    component: reportsView,
  },
  {
    path: "/gantt",
    name: "GanttView",
    // route level code-splitting
    // this generates a separate chunk (about.[hash].js) for this route
    // which is lazy-loaded when the route is visited.
    component: GanttView,
  },
 
];

const router = new VueRouter({
  mode: "history",
  routes,
});

export default router;
