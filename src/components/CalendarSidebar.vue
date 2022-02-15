<template>
  <div class="calendar-sidebar">
    <div id="external-events">
      <v-layout justify-center class="mt-4">
        <v-btn
          id="newTaskButton"
          color="success"
          @click="
            $root.$emit('call-father-task-dialog', {
              fatherTaskId: null,
              isTemplate: false,
              loadFromTemplate: false,
              editTitle: true,
            })
          "
        >
          <div>צור משימה</div>
          <v-icon>mdi-plus</v-icon>
        </v-btn>
      </v-layout>

      <div style="margin-top: 30px">
        <!-- <span style="float:right; text-decoration: underline;"
          ><h3>עובדים משובצים:</h3></span
        > -->

        <v-autocomplete
          v-model="staffFilter"
          label="צווות משובץ"
          :items="allStaffByDomains"
          :search-input.sync="searchInput"
          @change="searchInput=''"
          item-text="name"
          item-value="id"
          :filter="entitySearch"
          hide-no-data
          small-chips
          multiple
        >
          <template v-slot:selection="data">
            <v-chip
              small
              v-bind="data.attrs"
              :input-value="data.selected"
              close
              @click:close="removeSearchStaff(data.item)"
            >
              {{ data.item.name }}
            </v-chip>
          </template>
          <template v-slot:item="data">
            <template v-if="typeof data.item !== 'object'">
              <v-list-item-content v-text="data.item"></v-list-item-content>
            </template>
            <template v-else>
              <v-list-item-content>
                <v-list-item-title v-html="data.item.name"></v-list-item-title>
                <v-list-item-subtitle
                  v-html="data.item.team_name"
                ></v-list-item-subtitle>
              </v-list-item-content>
            </template>
          </template>
        </v-autocomplete>
        <v-btn-toggle
          mandatory
          v-model="searchMode"
          style="float: right; margin-top: -15px"
        >
          <v-btn
            x-small
            v-for="mode in searchModeOptions"
            :key="mode.id"
            :value="mode.id"
            >{{ mode.name }}</v-btn
          >
        </v-btn-toggle>
        <br />
      </div>
      <div style="text-align: center">
        <h3 style="text-decoration: underline">הצג משימות לפי:</h3>
        <v-btn-toggle mandatory v-model="tasksDisplayMode">
          <v-btn value="1">שם<br />משימה</v-btn>
          <v-btn value="2">שם<br />משימת אב</v-btn>
          <v-btn value="3">צוות<br />משובץ</v-btn>
        </v-btn-toggle>
      </div>

      <div id="external-events-listing">
        <div v-for="domain in domains" :key="domain.id" class="mt-4">
          <v-checkbox
            v-model="domainsFilter"
            :label="domain.name"
            :value="domain.id"
          ></v-checkbox>
          <div
            v-for="fatherTask in $store.state.tasks.fatherTasks.filter(
              (fatherTask) =>
                getFatherTaskTasksToDisplay(fatherTask, domain).length > 0
            )"
            :key="fatherTask.id"
          >
            <!-- .filter(
              fatherTask =>
                GetUnscheduleTasks.filter(
                  task => task.father_id == fatherTask.id.length 
                ) > 0
            "
            -->
            <div
              v-if="getFatherTaskTasksToDisplay(fatherTask, domain).length > 1"
            >
              <!-- <v-checkbox
                v-model="checkedSidebarFatherTasks"
                :value="fatherTask.id"
              > -->
              <div class="container">
                <div class="round">
                  <input
                    type="checkbox"
                    :id="'father-' + fatherTask.id"
                    :checked="
                      $store.state.tasks.checkedSidebarFatherTasks.includes(
                        fatherTask.id
                      )
                    "
                    @input="onfatherTaskCheckboxClick(fatherTask.id)"
                  />
                  <label :for="'father-' + fatherTask.id"></label>
                  {{ fatherTask.title }}
                </div>
              </div>

              <template slot="label">
                <h4 style="text-decoration: underline; margin-top: -15px">
                  {{ fatherTask.title }}
                </h4>
              </template>
            </div>
            <div
              v-for="task in getFatherTaskTasksToDisplay(fatherTask, domain)
                .length > 1
                ? GetUnscheduleTasks.filter(
                    (task) =>
                      task.domain_id == domain.id &&
                      task.father_id == fatherTask.id &&
                      $store.state.tasks.checkedSidebarFatherTasks.includes(
                        fatherTask.id
                      )
                  ).sort(function (a, b) {
                    return a.priority - b.priority;
                  })
                : GetUnscheduleTasks.filter(
                    (task) =>
                      task.domain_id == domain.id &&
                      task.father_id == fatherTask.id
                  )"
              :key="task.id"
              :id="task.id"
              :style="[
                task.color ? { backgroundColor: 'white' } : {},
                { overflow: 'hidden' },
              ]"
              @click="
                $emit('external-event-click', {
                  event: {
                    extendedProps: { father_id: task.father_id },
                    title: task.title,
                    id: task.id,
                  },
                })
              "
              :class="['fc-event', task.editable ? 'editable' : '']"
            >
              <v-tooltip top>
                <template v-slot:activator="{ on, attrs }">
                  <v-icon
                  :style="[
                task.color ? { color: task.color } : {},
                { overflow: 'hidden' },
              ]"
               style=" font-size: 17px; float: left"
                  >{{icons.mdiCheckboxBlankCircle}}</v-icon>
                  <div v-bind="attrs" v-on="on">
                    {{
                      "\xa0" +
                      (tasksDisplayMode == 1
                        ? task.title
                        : tasksDisplayMode == 2
                        ? getFatherTaskTitle(task.father_id)
                        : task.crew.length > 0
                        ? task.crew
                            .map((id) => {
                              const employee = allStaff.find(
                                (entity) => entity.id == id
                              );
                              return employee.name;
                            })
                            .join(", ")
                        : "לא שובצו עובדים")
                    }}

                    <i
                      v-if="task.urgency_id == 3"
                      class="v-icon mdi mdi-alert-box"
                      style="color: black; font-size: 17px; float: right"
                    ></i>
                    <i
                      v-if="task.is_reschedule"
                      class="v-icon mdi mdi-clock-alert"
                      style="color: black; font-size: 17px; float: right"
                    ></i>
                    <i
                      v-if="task.creator_id == 'scheduler'"
                      class="v-icon mdi mdi-calendar-multiple-check"
                      style="color: #333; font-size: 17px; float: right"
                    ></i>
                    <i
                      v-if="task.fault_data !== null"
                      class="v-icon mdi mdi-tools"
                      style="color: #333; font-size: 17px; float: right"
                    ></i>
                  </div>
                </template>

                <div>{{ getFatherTaskTitle(task.father_id) }}</div>
                
              </v-tooltip>
            </div>
            <hr
              style="
                width: 90%;
                margin: 0 auto;
                height: 0px;
                border: none;
                border-top: 1.5px solid black;
              "
            />
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import moment from "moment";
import { Draggable } from "@fullcalendar/interaction";
import { mapGetters, mapActions, mapMutations } from "vuex";
import { mdiCheckboxBlankCircle } from '@mdi/js';
import tippy from "tippy.js";

export default {
  // name: "CalendarSidebar",
  computed: {
    ...mapGetters("metadata", [
      "domains",
      "taskTypes",
      "allStaff",
      "allStaffByDomains",
    ]),
    ...mapGetters([
      "GetUnscheduleTasks",
      "filters",
      "getSearchMode",
      "getFatherTaskTitle",
      "getTask",
    ]),
    //tasks search mode or(1), and(2)
    searchMode: {
      get() {
        return this.getSearchMode;
      },
      set(value) {
        this.setFilters({ searchMode: value });
      },
    },
    //task title(1), father task title(2), crew(3)
    tasksDisplayMode: {
      get() {
        return this.$store.state.tasks.tasksDisplayMode;
      },
      set(value) {
        this.setTasksDisplayMode(value);
      },
    },
    //with domains are checked
    domainsFilter: {
      get() {
        return this.filters.domains;
      },
      set(value) {
        this.setFilters({ domains: value });
      },
    },
    //witch fatherTasks are checked
    // checkedSidebarFatherTasks: {
    //   get() {
    //     return this.$store.state.checkedSidebarFatherTasks;
    //   },
    //   set(value) {
    //     this.SET_UNCHECKED_SIDEBAR_FATHERTASKS(value);
    //   },
    // },
    //crew inserted to search (crew ids)
    staffFilter: {
      get() {
        return this.filters.staff;
      },
      set(value) {
        this.setFilters({ staff: value });
      },
    },
    //array of all father task titles
    fatherTasksTitles: function () {
      return this.$store.state.tasks.fatherTasks.map((fatherTask) => {
        return { id: fatherTask.id, title: fatherTask.title };
      });
    },
  },
  methods: {
    ...mapActions(["setUncheckedFatherTask"]),
    ...mapMutations(["setFilters", "setTasksDisplayMode"]),
    moment: moment,
    getFatherTaskTasksToDisplay(fatherTask, domain) {
      return this.GetUnscheduleTasks.filter(
        (task) => task.domain_id == domain.id && task.father_id == fatherTask.id
      );
    },
    onfatherTaskCheckboxClick(fatherId) {
      this.setUncheckedFatherTask(fatherId);
    },

    // /**
    //  * return full string for entity search
    //  *
    //  * @param {item} Object - person or team
    //  */
    // getEntityText(item) {
    //   return item.name + item.team_name;
    // },
    /**
     * search entity method
     *
     */
    entitySearch: (item, queryText, itemText) => {
      if ("team_name" in item) {
        return (
          (item.name + item.team_name)
            .toLocaleLowerCase()
            .indexOf(queryText.toLocaleLowerCase()) > -1
        );
      } else {
        return (
          itemText.toLocaleLowerCase().indexOf(queryText.toLocaleLowerCase()) >
          -1
        );
      }
    },
    /**
     * removed the staff from the search
     *
     * @event on search entity delete
     * @param {removedEntity} int - id of the entity
     */
    removeSearchStaff: function (removedEntity) {
      let updStaffSearch = this.filters.staff.filter(
        (entityId) => entityId != removedEntity.id
      );
      this.setFilters({ staff: updStaffSearch });
    },
    /**
     * calc full name for staff entity
     *
     * @param {entity} object - staff entity
     */
    // CalcEntityfullName(entity) {
    //   if ("name" in entity) {
    //     return entity.name;
    //   } else return entity;
    // },
  },
  data: function () {
    return {
      icons:{
        mdiCheckboxBlankCircle,
      },
      searchModeOptions: [
        { id: 1, name: "או" },
        { id: 2, name: "וגם" },
      ],
      tippys: {},
    };
  },
  /**
   * create Draggable for each task in sidebar
   *
   * @event on component mount
   */
  mounted: function () {
    const self = this;
    let draggableElements = document.getElementById("external-events-listing");
    new Draggable(draggableElements, {
      itemSelector: ".fc-event",
      eventData: function (eventEl) {
        return self.getTask(eventEl.id);
      },
    });
  },
  /**
   * create tooltip for each task in sidebar
   *
   * @event on component update
   */
  // updated: function() {

  //   this.GetUnscheduleTasks.forEach((task) => {
  //     let tip = tippy(document.getElementById(task.id), {
  //       content: `<div style="background: rgba(97,97,97,.9);
  //       color: #fff;
  //       border-radius: 4px;
  //       font-size: 14px;
  //       line-height: 22px;
  //       display: inline-block;
  //       padding: 5px 16px;">${this.getFatherTaskTitle(task.father_id)}</div>`,
  //       allowHTML: true,
  //       animation: "scale-extreme",
  //       duration: [200, 0],
  //     });
  //     this.tippys[task.id] = {
  //       instance: tip,
  //       father_id: task.father_id,
  //     };
  //   });
  // },
  watch: {
    /**
     * called when a certien father task title is changed, updates the relevent events tooltips.
     *
     * @event on father task title is change
     */
    // fatherTasksTitles: {
    //   immidiate: false,
    //   handler: function(newTitles, oldTitles) {
    //     for (let [key, value] of Object.entries(this.tippys)) {
    //       value.instance.setContent(
    //         `<div style="background: rgba(97,97,97,.9);
    //     color: #fff;
    //     border-radius: 4px;
    //     font-size: 14px;
    //     line-height: 22px;
    //     display: inline-block;
    //     padding: 5px 16px;">${this.getFatherTaskTitle(value.father_id)}</div>`
    //       );
    //     }
    //   },
    // },
  },
};
</script>

<style scoped>
/* body {
  margin-top: 40px;
  text-align: center;
  font-size: 14px;
  font-family: "Lucida Grande", Helvetica, Arial, Verdana, sans-serif;
}

#wrap {
  width: 1100px;
  margin: 0 auto;
} */

#external-events {
  float: left;
  width: 25vw;
  padding: 0 10px;
  border: 1px solid #ccc;
  background: #eee;
  font-family: "Roboto", sans-serif;
}

#external-events h4 {
  padding-left: 20px;
  overflow: hidden;
  font-size: 16px;
  margin-top: 0;
  padding-top: 1em;
  align-self: right;
}

.fc-event {
  /* position: relative; */
  text-align: right;
  color: #2c3e50;
  display: block;
  /* font-size: 0.95em; */
  /* font-style: italic; */
  line-height: 1.3;
  border-radius: 4px;
  background-color: #3788d8;
  /* font-weight: 400; */
}

#external-events .fc-event {
  margin: 10px 0;
  cursor: pointer;
  font-family: "Roboto", sans-serif;
}

.checkbox label {
  text-align: right;
  float: left;
}

.round {
  position: relative;
}

.round label {
  background-color: #fff;
  border: 1px solid #ccc;
  border-radius: 50%;
  cursor: pointer;
  height: 20px;
  left: 0;
  position: absolute;
  top: 2px;
  width: 20px;
  right: -15px;
}

.round label:after {
  border: 2px solid #fff;
  border-top: none;
  border-right: none;
  content: "";
  height: 5px;
  left: 3.8px;
  opacity: 0;
  position: absolute;
  top: 5px;
  transform: rotate(-45deg);
  width: 12px;
}

.round input[type="checkbox"] {
  visibility: hidden;
}

.round input[type="checkbox"]:checked + label {
  background-color: #66bb6a;
  border-color: #66bb6a;
}

.round input[type="checkbox"]:checked + label:after {
  opacity: 1;
}
</style>
