<template>
  <div id="Template-Table">
    <div class="templateTable">
      <v-card-title>
        <v-btn
          class="margin:auto 0 auto 0"
          color="success"
          @click="onCreateNewFatherTask"
        >
          <div>צור משימה</div>
          <v-icon>mdi-plus</v-icon>
        </v-btn>

        <v-autocomplete
          label="חיפוש לפי מנהל"
          style="max-width: 15%; padding-top: 20px; margin-right: 160px"
          v-model="managerSearch"
          :items="$store.state.metadata.persons"
          item-text="name"
          item-value="id"
          deletable-chips
          multiple
          small-chips
        >
          <template v-slot:item="data">
            <template>
              <v-list-item-content
                v-text="data.item.name"
              ></v-list-item-content>
            </template>
          </template>
        </v-autocomplete>
        <v-select
          style="max-width: 15%; padding-top: 10px; margin-right: 50px"
          v-model="domainsFilter"
          :items="domains"
          label="תחומים"
          item-text="name"
          item-value="id"
          multiple
          chips
        ></v-select>
        <div style="max-width: 20%; padding-top: 25px; margin-right: 50px">
          <v-autocomplete
            v-model="staffFilter"
            label="צווות משובץ"
            :items="allStaffByDomains"
            item-text="name"
            item-value="id"
            :filter="entitySearch"
            hide-no-data
            small-chips
            multiple
          >
            <template v-slot:selection="data">
              <v-chip
                style="padding: 0 10px 0 8px"
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
                  <v-list-item-title
                    v-html="data.item.name"
                  ></v-list-item-title>
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
        </div>
        <v-spacer />
        <v-text-field
          style="max-width: 15%; margin-right: 50px"
          v-model="search"
          append-icon="mdi-magnify"
          label="חיפוש"
          single-line
          hide-details
        ></v-text-field>
      </v-card-title>
      <v-data-table
        :headers="Headers"
        :items="fatherTasks"
        item-key="fatherTask.id"
        show-expand
        :expanded.sync="expanded"
        :single-expand="true"
        :items-per-page="20"
        loading-text="טוען... נא להמתין"
        no-data-text="אין תבניות"
        @click:row="onEventClick"
        locale="he"
        dir="rtl"
        :search="search"
        :managerSearch="managerSearch"
        :footer-props="{
          showCurrentPage: true,
          itemsPerPageOptions: [20, 35, 50, -1],
        }"
      >
        <template v-slot:[`item.fatherTask.manager`]="{ item }">
          {{ allStaffDict[item.fatherTask.manager] }}
        </template>
        <template v-slot:[`item.fatherTask.status_id`]="{ item }">
          <div
            :style="{
              width: '50%',
              color:
                item.fatherTask.status_id == statuses[0].id
                  ? '#4083ff'
                  : item.fatherTask.status_id == statuses[1].id
                  ? 'orange'
                  : '#4CAF50',
            }"
          >
            {{ statusesDict[item.fatherTask.status_id] }}
          </div>
          <!-- <v-btn
            :style="{
              width: '50%',
              color:
                item.fatherTask.status_id == statuses[0].id
                  ? '#4083ff'
                  : item.fatherTask.status_id == statuses[1].id
                  ? 'orange'
                  : '#4CAF50',
            }"
            >{{ statusesDict[item.fatherTask.status_id] }}</v-btn
          > -->
        </template>
        <template v-slot:expanded-item="{ headers, item }">
          <td :colspan="headers.length">
            <span
              v-for="subTemplates in item.tasks"
              :key="item.tasks.indexOf(subTemplates)"
              ><br />
              <b class="mr-2">{{ item.tasks.indexOf(subTemplates) + 1 }}.</b>
              <b class="mr-2">כותרת: </b>{{ subTemplates.title }}
              <b class="mr-2">דחיפות: </b
              ><span
                :style="{
                  color:
                    subTemplates.urgency_id == urgencies[2].id ? 'red' : null,
                }"
                >{{ urgenciesDict[subTemplates.urgency_id] }}</span
              >
              <b class="mr-2">סטטוס: </b
              ><span
                :style="{
                  color:
                    subTemplates.status_id == statuses[0].id
                      ? '#4083ff'
                      : subTemplates.status_id == statuses[1].id
                      ? 'orange'
                      : '#4CAF50',
                }"
                >{{ statusesDict[subTemplates.status_id] }}</span
              >
              <b class="mr-2">תחום אחראי: </b
              >{{ domainsDict[subTemplates.domain_id] }}
              <b class="mr-2">סוג משימה: </b
              >{{ taskTypesDict[subTemplates.type_id] }}
              <b class="mr-2">צוות משובץ: </b>
              <span v-if="subTemplates.crew.length > 0">
                <div
                  style="display: inline"
                  v-for="member in subTemplates.crew"
                  :key="subTemplates.crew.indexOf(member)"
                >
                  {{ allStaffDict[member] }}
                  <span
                    v-if="
                      subTemplates.crew.indexOf(member) !=
                      subTemplates.crew.length - 1
                    "
                    >,</span
                  >
                </div>
              </span>
              <span v-else> לא שובצו עובדים </span>
              <b class="mr-2">תוכן: </b>{{ subTemplates.description }}
              <br />
            </span>
            <br />
          </td>
        </template>
      </v-data-table>
    </div>
  </div>
</template>

<script>
import { mapGetters, mapActions, mapMutations } from "vuex";
import { addHours, addDays } from "date-fns";

export default {
  name: "FatherTasksTable",
  computed: {
    ...mapGetters([
      "filterTasks",
      "getTask",
      "getFatherTasksWithChilds",
      "getFatherTask",
      "filters",
    ]),

    ...mapGetters("metadata", [
      "domains",
      "urgenciesDict",
      "statusesDict",
      "domainsDict",
      "taskTypesDict",
      "allStaffDict",
      "statuses",
      "urgencies",
      "allStaffByDomains",
    ]),
    //with domains are checked
    domainsFilter: {
      get() {
        return this.filters.domains;
      },
      set(value) {
        this.setFilters({ domains: value });
      },
    },
    //with staff entities are selcted
    staffFilter: {
      get() {
        return this.filters.staff;
      },
      set(value) {
        this.setFilters({ staff: value });
      },
    },
    //tasks search mode or(1), and(2)
    searchMode: {
      get() {
        return this.getSearchMode;
      },
      set(value) {
        this.setFilters({ searchMode: value });
      },
    },
    fatherTasks() {
      let fathersTasksDict = {};
      this.filterTasks.forEach((task) => {
        let fatherTask = this.getFatherTask(task.father_id);
        if (!fatherTask) return;
        if (this.managerSearch.length > 0) {
          if (!this.managerSearch.includes(fatherTask.manager)) {
            return;
          }
        }
        if (task.father_id in fathersTasksDict) {
          fathersTasksDict[task.father_id].tasks.push(task);
        } else {
          fathersTasksDict[task.father_id] = {
            fatherTask: fatherTask,
            tasks: [task],
          };
        }
      });
      return Object.keys(fathersTasksDict).map(
        (father_id) => fathersTasksDict[father_id]
      );
    },
  },
  data: function () {
    return {
      searchModeOptions: [
        { id: 1, name: "או" },
        { id: 2, name: "וגם" },
      ],
      expanded: [],
      search: "",
      managerSearch: [this.$store.state.userData.uid],
      subTasks: [
        "תת משימה #1 - פריסת כבלים",
        "תת משימה #2 - הכפלת שנאי ירקון מזרח",
      ],
      Headers: [
        {
          text: "מספר",
          align: "start",
          value: "fatherTask.id",
          width: "10%",
        },
        { text: "כותרת", value: "fatherTask.title", width: "18%" },
        { text: "מנהל", value: "fatherTask.manager", width: "18%" },
        { text: "דדליין", value: "fatherTask.deadline", width: "18%" },
        { text: "סטטוס", value: "fatherTask.status_id", width: "18%" },
        {
          text: "תאריך סיום בפועל",
          value: "fatherTask.completed_date",
          width: "18%",
        },
      ],
      preiodicFetch: null,
    };
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
  methods: {
    ...mapActions(["fetchUsersTasks", "fetchUsersFatherTasks"]),
    ...mapActions("tasksTemplates", ["fetchAlltemplates"]),
    ...mapMutations(["setFilters", "setTasksDisplayMode"]),
    removeSearchStaff: function (removedEntity) {
      let updStaffSearch = this.filters.staff.filter(
        (entityId) => entityId != removedEntity.id
      );
      this.setFilters({ staff: updStaffSearch });
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
    onEventClick(row) {
      this.$root.$emit("call-father-task-dialog", {
        fatherTaskId: row.fatherTask.id,
        isTemplate: false,
        editTitle: true,
      });
    },
    onCreateNewFatherTask: function () {
      this.$root.$emit("call-father-task-dialog", {
        fatherTaskId: null,
        isTemplate: false,
        loadFromTemplate: false,
        editTitle: true,
      });
    },
  },
};
</script>

<style scoped>
* {
  padding: 0;
  margin: 0;
  box-sizing: border-box;
}

html,
body {
  height: 100vh;
}

body {
  font-family: Arial, Helvetica Neue, Helvetica, sans-serif;
  font-size: 14px;
}
</style>

<style scoped>
#Template-Table {
  display: flex;
  overflow: hidden;
}

.templateTable {
  flex: 1;

  padding: 2em;
}

.v-btn--fab {
  margin-left: 5px;
}
</style>
