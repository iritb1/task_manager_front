<template>
  <div id="Calendar">
    <v-btn
      @click="moveSidebar"
      style="z-index: 200; position: absolute; top: 5px; right: 5px"
    >
      <v-icon v-if="showSidebar">mdi-arrow-expand-right</v-icon>
      <v-icon v-else>mdi-arrow-expand-left</v-icon>
    </v-btn>
    <!-- <calendar-sidebar
      v-if="showSidebar"
      v-on:external-event-click="onEventClick"
    /> -->
    <calendar-sidebar
      :class="[showSidebar ? 'sidebar-show' : 'sidebar-hide']"
      v-on:external-event-click="onEventClick"
    />
    <div class="calendar" :class="[showSidebar ? 'calendar' : 'calendar-full']">
      <full-calendar ref="fullCalendar" class="full-calendar" :options="config">
        <template #eventContent="{ timeText, event }">
          <b>{{ timeText }}</b>
          <i>{{ event.title }}</i>
        </template>
      </full-calendar>
      <v-dialog v-model="dropedTaskDialog" width="80%">
        <v-toolbar dark color="primary">
          <v-text-field
            solo
            flat
            background-color="primary"
            :value="getFatherTaskTitle(dropedTask.father_id)"
            readonly
            class="title"
            style="margin-top: auto; font-size: 2em !important"
          >
          </v-text-field>
        </v-toolbar>
        <taskCard
          v-model="dropedTask"
          :isDragedPopUp="true"
          @on-task-save="onExternalDropSave"
        />
      </v-dialog>
    </div>
  </div>
</template>

<script>
import { mapGetters, mapActions } from "vuex";
import { addHours, addDays } from "date-fns";
import FullCalendar from "@fullcalendar/vue";
import dayGridPlugin from "@fullcalendar/daygrid";
import timeGridPlugin from "@fullcalendar/timegrid";
import interactionPlugin from "@fullcalendar/interaction";
import listPlugin from "@fullcalendar/list";
import he from "@fullcalendar/core/locales/he";
import moment from "moment";

import CalendarSidebar from "./CalendarSidebar.vue";
import taskCard from "./taskCard";
import $ from "jquery";
import tippy from "tippy.js";
import "tippy.js/animations/scale-extreme.css";
export default {
  components: {
    FullCalendar,
    CalendarSidebar,
    taskCard,
  },
  computed: {
    ...mapGetters(["filterTasks", "getTask", "getFatherTaskTitle"]),
    ...mapGetters("metadata", ["allStaff"]),
    timeZoneOffset: function () {
      return new Date().getTimezoneOffset() / -60;
    },
    //array of all father task titles
    fatherTasksTitles: function () {
      return this.$store.state.tasks.fatherTasks.map((fatherTask) => {
        return { id: fatherTask.id, title: fatherTask.title };
      });
    },
    //task title(1), father task title(2), crew(3)
    taskDisplayMode: function () {
      return this.$store.state.tasks.tasksDisplayMode;
    },
    //fullcalander config
    config() {
      return {
        ...this.configOptions,
        ...this.eventHandlers,
      };
    },

    configOptions() {
      return {
        // this allows things to be dropped onto the calendar
        droppable: true,
        //when no room to display event, create popover instead of stretching the day.
        dayMaxEvents: 7,
        selectable: true,
        //event source
        events: this.filterTasks,
        plugins: [dayGridPlugin, timeGridPlugin, interactionPlugin, listPlugin],
        headerToolbar: {
          right: "prev,next today",
          center: "title",
          left: "dayGridMonth,timeGridWorkWeek,timeGridDay,listMonth",
        },
        initialView: "dayGridMonth",
        views: {
          timeGridWorkWeek: {
            type: "timeGrid",
            duration: { weeks: 1 },
            hiddenDays: [5, 6],
            buttonText: "שבוע עבודה",
          },
        },
        locale: he,
        timeZone: "UTC",
        height: "calc(100vh - 110px)",
        eventOrder: this.eventOrder,
        // hiddenDays: [ 5, 6 ]
        // contentHeight: "auto",
        // contentHeight: "calc(100vh - 180px)",
        // height: "calc(100vh - 120px)"
      };
    },

    eventHandlers() {
      return {
        //Triggered when a new date-range is rendered, or when the view type switches.
        datesSet: this.datesSet,
        // called once when event is mounted to the calander.
        eventDidMount: this.eventDidMount,
        // called every time the associated event data changes
        eventContent: this.eventContent,
        eventClick: this.onEventClick,
        eventDrop: this.onInternalEventDrop,
        eventResize: this.onInternalEventDrop,
        select: this.onDateSelect,
        // dateClick: this.onDateClick,
        eventReceive: this.onEventReceive,
        // eventDragStart: this.eventDragStart,
      };
    },
  },
  data: function () {
    return {
      showSidebar: false,
      dropedTaskDialog: false,
      dropedTask: {},
      eventLenth: null,
      tippys: {},
      preiodicFetch: null,
    };
  },
  methods: {
    ...mapActions("metadata", ["fetchMetadata"]),
    ...mapActions(["fetchUsersTasks", "fetchUsersFatherTasks"]),
    ...mapActions("tasksTemplates", ["deleteTemplate", "fetchAlltemplates"]),
    ...mapActions("fatherTaskDialog/", ["onTaskClick"]),
    ...mapActions(["updateTaskAsync", "updateTaskSync"]),
    moveSidebar() {
      this.showSidebar = !this.showSidebar;
      // this.setTimeout(() => {
      //   this.$refs.fullCalendar.getApi().render();
      // }, 3000);
    },
    //how to order events in calander (same day for example)
    eventOrder(event) {
      if (event.background) {
        return -1;
      }
      return 1;
    },
    datesSet({ start, end, view }) {
      console.log("onViewRender", start, end, view);
    },

    /**
     *creating the content for each event in the calander, called every time event is edited.
     *
     * @param {object} event - full calander event object
     * @return {object} content - html elemnt
     */
    eventContent: function ({ event }) {
      let eventTitle;
      if (this.taskDisplayMode == 1) {
        eventTitle = event.title;
      }
      if (this.taskDisplayMode == 2) {
        eventTitle = this.getFatherTaskTitle(event.extendedProps.father_id);
      }
      if (this.taskDisplayMode == 3) {
        eventTitle =
          event.extendedProps.crew.length > 0
            ? event.extendedProps.crew
                .map((id) => {
                  const employee = this.allStaff.find(
                    (entity) => entity.id == id
                  );
                  return employee.name;
                })
                .join(", ")
            : "לא שובצו עובדים";
      }
      let icons = [];
      if (event.extendedProps.urgency_id == 3) {
        icons.push(
          `<i class="v-icon mdi mdi-alert-box" style=" display:contents;color:black; font-size: 1.2em"></i>`
        );
      }
      if (event.extendedProps.creator_id == "scheduler") {
        icons.push(
          `<i class="v-icon mdi mdi-calendar-multiple-check" style=" display:contents; color:#333; font-size: 1.2em"></i>`
        );
      }
      if (event.extendedProps.fault_data !== null) {
        icons.push(
          `<i class="v-icon mdi mdi-tools" style="display:contents;color:#333; font-size: 1.2em;"></i>`
        );
      }
      // if (event.extendedProps.is_reschedule) {
      //   icons.push(
      //     `<i class="v-icon mdi mdi-clock-alert" style="color:black; font-size: 17px; float:right; "></i>`
      //   );
      // }

      if (icons.length > 0) {
        let titleLenth = (this.eventLenth - icons.length * 17) / 7;
        eventTitle = `<span>${icons.join("")}<span >${
          " " + eventTitle
        }</span></span>`;
      } else {
        eventTitle = `<span class="inner">${eventTitle}</span>`;
      }
      // let eventInnerHTML = `<div style="text-align:center" class="fc-event-main-frame"><div class="fc-event-title-container"><div class="fc-event-title fc-sticky">${eventTitle}</div></div></div>`;
      let eventInnerHTML = `<div style="overflow: hidden;
    text-overflow: ellipsis;
    display: -webkit-box;
    -webkit-line-clamp: 2;
    -webkit-box-orient: vertical;
    text-align:center;
    border-color: ${event.backgroundColor};
    border-radius:3px;
    background-color: ${event.backgroundColor};
    color: #2c3e50;
    width: 100%;
    line-height: 1.1em;
    white-space: normal"
    ${eventTitle}</div>`;
      return { html: eventInnerHTML };
    },
    /**
     * called once when event is mounted to the calander.
     * creates tooltip for the event.
     *
     * @param {object} el - the html elemnt of the event
     * @param {object} event - full calander event object
     */
    eventDidMount: function ({ el, event }) {
      // let taskHTML = el.innerHTML;
      // let icons = [];
      // if (event.extendedProps.urgency_id == 3) {
      //   let totalWidth = el.clientWidth;
      //   icons.push(
      //     `<i class="v-icon mdi mdi-alert-box" style="color:red; font-size: 17px; float:left; "></i>`
      //   );
      // }
      // let deadlineMissed = false;
      // if (deadlineMissed) {
      //   icons.push(
      //     `<i class="v-icon mdi mdi-clock-alert" style="color:black; font-size: 17px; float:left; "></i>`
      //   );
      // }
      // let eventInnerHTML;
      // let eventTitle;
      // if (this.taskDisplayMode == 1) {
      //   eventTitle = event.title;
      // }
      // if (this.taskDisplayMode == 2) {
      //   eventTitle = this.getFatherTaskTitle(event.extendedProps.father_id);
      // }
      // if (this.taskDisplayMode == 3) {
      //   eventTitle = event.extendedProps.crew.map(
      //     (id) => this.allStaff.find((entity) => entity.id == id).name
      //   );
      // }
      // if (icons.length > 0) {
      //   let titleLenth = (el.clientWidth - icons.length * 17) / 7;
      //   eventInnerHTML = `<span class="inner">${icons.join(
      //     ""
      //   )}<span>${eventTitle.slice(0, titleLenth)}</span></span>`;
      // } else {
      //   eventInnerHTML = `<span class="inner">${eventTitle}</span>`;
      // }
      // el.childNodes[0].innerHTML = eventInnerHTML;
      if (this.eventLenth != el.clientWidth) {
        this.eventLenth = el.clientWidth;
        this.$refs.fullCalendar.getApi().render();
      }
      if (
        !el.classList.contains("fc-event-dragging") &&
        !el.classList.contains("fc-event-resizing")
      ) {
        if (event.id in this.tippys) {
          this.tippys[event.id].instance.destroy();
        }
        let tip = tippy(el, {
          content: `<div style="font-family:'Roboto',sans-serif; background: rgba(97,97,97,.9);
        color: #fff;
        border-radius: 4px;
        font-size: 14px;
        line-height: 22px;
        display: inline-block;
        padding: 5px 16px;">
        <div style="text-align:center; text-decoration: underline;font-weight:bold">${this.getFatherTaskTitle(
          event.extendedProps.father_id
        )}</div>
        <div style="text-align:center">${event.title}</div>
         <div style="text-align:center">${moment(event.start)
           .subtract(this.timeZoneOffset, "hours")
           .format("HH:mm")}-${moment(event.end)
            .subtract(this.timeZoneOffset, "hours")
            .format("HH:mm")}</div>
        </div>`,
          allowHTML: true,
          animation: "scale-extreme",
          duration: [200, 0],
        });
        this.tippys[event.id] = {
          instance: tip,
          props: {
            fatherId: event.extendedProps.father_id,
            title: event.title,
            start: event.start,
            end: event.end,
          },
        };
      }
    },
    /**
     * open dialog for the clicked event
     *
     * @event onEventClick
     * @param {object} event - full calander event object
     */
    onEventClick({ event }) {
      this.$root.$emit("call-father-task-dialog", {
        fatherTaskId: event.extendedProps.father_id,
        isTemplate: false,
        loadFromTemplate: false,
        range: null,
        editTitle: false,
        taskId: event.id,
      });
    },
    /**
     * updates the draged event start and finish time,
     * calls special sync vuex action thats update the event without wating to server response.
     *
     * @event on internal event drop
     * @param {object} event - full calander event object
     * @param {function} revert - full calander revert function (fullcalander updating the is event automaticly).
     */
    onInternalEventDrop({ event, revert }) {
      // revert();
      let task = this.getTask(event.id);
      let updTask = JSON.parse(JSON.stringify(task));
      updTask.start = new Date(event._instance.range.start);
      updTask.end = new Date(event._instance.range.end);
      updTask.allDay = event.allDay;
      this.updateTaskSync({ task, updTask });
    },
    /**
     * called after drop dialog confirm, update the event according to data dialog recived
     *
     * @event on extenal event dialog save
     */
    onExternalDropSave() {
      this.dropedTaskDialog = false;
      this.updateTaskAsync(this.dropedTask);
    },
    /**
     * Triggered when a date/time selection is made. create new father task with task on the selected period.
     *
     * @event on extenal event dialog save
     */
    onDateSelect(selectionInfo) {
      if (
        this.$store.state.userData.permissions.includes("ADMIN") ||
        this.$store.state.userData.permissions.includes("LEAD")
      ) {
        let range = {};
        range.start = new Date(selectionInfo.start);
        range.end = new Date(selectionInfo.end);
        this.$root.$emit("call-father-task-dialog", {
          fatherTaskId: null,
          isTemplate: false,
          loadFromTemplate: false,
          range: range,
          editTitle: true,
          taskId: null,
        });
      }
    },
    onDateClick(info) {
      //pass
    },
    /**
     * called when external event droped in the callander, open dialog with event data and drop data.
     *
     * @event on external event drop
     */
    onEventReceive(info) {
      info.revert();
      let task = JSON.parse(JSON.stringify(this.getTask(info.draggedEl.id)));
      task.start = new Date(info.event._instance.range.start);
      task.end = new Date(info.event._instance.range.end);
      // task.allDay = info.event.allDay;
      this.dropedTask = task;
      this.dropedTaskDialog = true;
    },
  },
  created() {
    this.preiodicFetch = setInterval(() => {
      this.fetchUsersTasks();
      this.fetchUsersFatherTasks();
      this.fetchAlltemplates();
    }, this.$store.state.config.FETCH_INTERVAL);
  },
  beforeDestroy() {
    clearInterval(this.preiodicFetch);
  },
  watch: {
    /**
     * called when events display mode changed, rerender all the calender events.
     *
     * @event on events display mode change
     * @param {int} newMode  - 1,2,3
     */
    taskDisplayMode: function (newMode) {
      this.$refs.fullCalendar.getApi().render();
    },
    /**
     * called when a certien father task title is changed, updates the relevent events tooltips.
     *
     * @event on father task title is change
     */
    fatherTasksTitles: {
      immidiate: false,
      handler: function () {
        this.$refs.fullCalendar.getApi().render();
        for (let [key, value] of Object.entries(this.tippys)) {
          value.instance.setContent(
            `<div style="font-family:'Roboto',sans-serif; background: rgba(97,97,97,.9);
        color: #fff;
        border-radius: 4px;
        font-size: 14px;
        line-height: 22px;
        display: inline-block;
        padding: 5px 16px;">
        <div style="text-align:center; text-decoration: underline;font-weight:bold">${this.getFatherTaskTitle(
          value.props.fatherId
        )}</div>
        <div style="text-align:center">${value.props.title}</div>
         <div style="text-align:center">${moment(value.props.start)
           .subtract(2, "hours")
           .format("hh:mm")}-${moment(value.props.end)
              .subtract(2, "hours")
              .format("hh:mm")}</div>
        </div>`
          );
        }
      },
    },
  },
};
</script>

<style>
* {
  padding: 0;
  margin: 0;
  box-sizing: border-box;
}

/* body {
  font-family: Arial, Helvetica Neue, Helvetica, sans-serif;
  font-size: 15px;
} */

body .mdi {
  margin-top: 1.4px;
}
</style>

<style>
.fc-daygrid-dot-event {
  /* force events to be one-line tall */
  white-space: nowrap !important;
  overflow: hidden;
}

#Calendar {
  display: flex;
  /* overflow: hidden; */
}

.sidebar-show {
  /* visibility: visible; */
  /* position: fixed; */
  -webkit-animation: slideIn 0.6s;
  animation: slideIn 0.6s;
}
.sidebar-hide {
  display: inline-block;
  position: fixed;
  z-index: 1;
  -webkit-animation: slideOut 1s;
  animation: slideOut 1s;
  right: -1000px;
}

@keyframes slideIn {
  0% {
    right: -1000px;
  }
  100% {
    right: 0;
  }
}
@keyframes slideOut {
  0% {
    right: 0;
  }
  100% {
    right: -1000px;
  }
}

.calendar {
  flex: 1;
  padding: 1.5em;
  position: fixed;
  width: calc(100% - 25vw);
  right: 25vw;
  -webkit-animation: calanderSlideIn 0.6s;
  animation: calanderSlideIn 0.6s;
}
.calendar-full {
  flex: 1;
  padding: 1.5em;
  position: fixed;
  width: calc(100% - 3vw);
  right: 3vw;
  -webkit-animation: calanderSlideOut 1s;
  animation: calanderSlideOut 1s;
}

@keyframes calanderSlideIn {
  0% {
    right: 3vw;
  }
  100% {
    right: 25vw;
  }
}
@keyframes calanderSlideOut {
  0% {
    right: 25vw;
  }
  100% {
    right: 3vw;
  }
}

#tooltip {
  background: #333;
  color: white;
  font-weight: bold;
  padding: 4px 8px;
  font-size: 13px;
  border-radius: 4px;
}

.fc-daygrid-event {
  white-space: normal im !important;
  margin-bottom: 3px;
}

.fc-daygrid-dot-event {
  white-space: normal !important;
  /* padding-top: 0; */
}
</style>
