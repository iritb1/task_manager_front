<template>
  <div id="Template-Table">
    <div class="templateTable">
      <v-card-title>
        <v-btn
          class="ml-6 mt-6"
          color="success"
          @click="$root.$emit('call-task-scheduler-dialog')"
        >
          <div>צור תזמון</div>
          <v-icon>mdi-plus</v-icon>
        </v-btn>
        <v-spacer></v-spacer>
        <v-text-field
          v-model="search"
          append-icon="mdi-magnify"
          label="חיפוש"
          single-line
          hide-details
          style="max-width: 25%"
        ></v-text-field>
      </v-card-title>
      <v-data-table
        v-if="
          $store.state.tasksSchedulers.fetched &&
          Array.isArray($store.state.tasksTemplates.templates)
        "
        :headers="Headers"
        :items="allFullSchedulers"
        item-key="scheduler.id"
        show-expand
        :expanded.sync="expanded"
        :single-expand="true"
        :items-per-page="20"
        loading-text="טוען... נא להמתין"
        no-data-text="אין תבניות"
        locale="he"
        dir="rtl"
        :search="search"
        :footer-props="{
          showCurrentPage: true,
          itemsPerPageOptions: [20, 35, 50, -1],
        }"
      >
        <template v-slot:[`item.interval`]="{ item }">
          {{
            item.scheduler.interval_value +
            " " +
            $store.state.config.INTERVALS_TYPES[item.scheduler.freq]
          }}
        </template>
        <template v-slot:[`item.specific_value`]="{ item }">
          {{
            item.scheduler.freq == 2
              ? item.scheduler.specific_value
                  .reduce(
                    (accumulator, day) =>
                      accumulator +
                      weekdays.find((weekday) => weekday.value == day).text +
                      ", ",
                    ""
                  )
                  .slice(0, -2)
              : item.scheduler.freq == 1
              ? item.scheduler.specific_value.toString()
              : null
          }}
        </template>
        <template v-slot:[`item.next_date`]="{ item }">
          {{ formatDate(item.scheduler.next_date) }}
        </template>

        <template v-slot:[`item.actions`]="{ item }">
          <v-tooltip top>
            <template v-slot:activator="{ on, attrs }">
              <v-btn
                v-bind="attrs"
                v-on="on"
                small
                color="success"
                fab
                @click="
                  $root.$emit('call-task-scheduler-dialog', item.scheduler.id)
                "
              >
                <v-icon>mdi-calendar-clock</v-icon>
              </v-btn>
            </template>
            <pre class="tab"> ערוך תזמון </pre>
          </v-tooltip>
          <v-tooltip top>
            <template v-slot:activator="{ on, attrs }">
              <v-btn
                v-bind="attrs"
                v-on="on"
                small
                color="success"
                fab
                @click="
                  $root.$emit('call-father-task-dialog', {
                    fatherTaskId: item.fatherTask.id,
                    isTemplate: true,
                    loadFromTemplate: false,
                    editTitle: true,
                  })
                "
              >
                <v-icon>mdi-table-edit</v-icon>
              </v-btn>
            </template>
            <pre class="tab"> ערוך שבלונה </pre>
          </v-tooltip>
          <v-tooltip top>
            <template v-slot:activator="{ on, attrs }">
              <v-btn
                v-bind="attrs"
                v-on="on"
                small
                color="error"
                fab
                @click.stop="onDeleteScheduler(item.scheduler)"
              >
                <v-icon>mdi-delete</v-icon>
              </v-btn>
            </template>
            <pre class="tab"> מחק </pre>
          </v-tooltip>
        </template>

        <template v-slot:expanded-item="{ headers, item }">
          <!--    <p style="width:15vw">
                <span>תת משימה #1 - פריסת כבלים</span>  
                <br>
                <span>תת משימה #2 - הכפלת שנאי ירקון מזרח</span>
            </p> -->
          <td :colspan="headers.length">
            <span
              v-for="subTemplates in item.tasks"
              :key="item.tasks.indexOf(subTemplates)"
            >
              <b class="mr-2">תת משימה #</b
              >{{ item.tasks.indexOf(subTemplates) + 1 }}
              <b class="mr-2">כותרת:</b>{{ subTemplates.title }}
              <b class="mr-2">דחיפות:</b
              >{{ urgenciesDict[subTemplates.urgency_id] }}
              <b class="mr-2">סטטוס:</b
              >{{ statusesDict[subTemplates.status_id] }}
              <b class="mr-2"> תחום אחראי:</b
              >{{ domainsDict[subTemplates.domain_id] }}
              <b class="mr-2"> סוג משימה:</b
              >{{ taskTypesDict[subTemplates.type_id] }}
              <b class="mr-2"> צוות משובץ:</b>
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
              <b class="mr-2">תוכן:</b>{{ subTemplates.description }}
              <br />
            </span>
          </td>
        </template>
      </v-data-table>
      <v-progress-linear
        style="margin: 50px auto 0 auto; width: 95vw"
        v-else
        indeterminate
      ></v-progress-linear>
    </div>
    <taskSchedulerDialog />
  </div>
</template>

<script>
import { mapGetters, mapActions } from "vuex";
import { addHours, addDays } from "date-fns";
import taskSchedulerDialog from "./taskSchedulerDialog";

export default {
  components: { taskSchedulerDialog },
  computed: {
    ...mapGetters("tasksSchedulers", ["allFullSchedulers"]),
    ...mapGetters("tasksTemplates", ["allTemplates"]),
    ...mapGetters("metadata", [
      "domains",
      "urgenciesDict",
      "statusesDict",
      "domainsDict",
      "taskTypesDict",
      "allStaffDict",
    ]),
  },
  data: function () {
    return {
      expanded: [],
      search: "",
      Headers: [
        {
          text: "מספר",
          align: "start",
          value: "scheduler.id",
          width: "10%",
        },
        { text: "שבלונה", value: "fatherTask.title", width: "15%" },
        {
          text: "מתרחש כל",
          value: "interval",
          width: "15%",
        },
        {
          text: "ימים מסויימים",
          value: "specific_value",
          width: "20%",
        },
        { text: "תאריך הבא", value: "next_date", width: "15%" },
        { text: "פעולות", value: "actions", width: "20%" },
      ],
      weekdays: [
        { value: 6, text: "ראשון" },
        { value: 0, text: "שני" },
        { value: 1, text: "שלישי" },
        { value: 2, text: "רביעי" },
        { value: 3, text: "חמישי" },
        { value: 4, text: "שישי" },
        { value: 5, text: "שבת" },
      ],
      preiodicFetch: null,
    };
  },
  created() {
    this.fetchAlltemplates();
    this.fetchAllTaskSchedulers();
    this.preiodicFetch = setInterval(() => {
      this.fetchAlltemplates();
      this.fetchAllTaskSchedulers();
    }, this.$store.state.config.FETCH_INTERVAL);
  },
  beforeDestroy() {
    clearInterval(this.preiodicFetch);
  },
  methods: {
    ...mapActions("tasksSchedulers", [
      "fetchAllTaskSchedulers",
      "deleteScheduler",
    ]),
    ...mapActions("tasksTemplates", ["deleteTemplate", "fetchAlltemplates"]),
    ...mapActions("tasksSchedulers", ["fetchAllTaskSchedulers"]),
    formatDate(date) {
      if (!date) return null;

      const [year, month, day] = date.split("-");
      return `${day}/${month}/${year}`;
    },
    onDeleteScheduler(scheduler) {
      this.$confirm({
        message: `האם אתה רוצה למחוק את מתזמן?`,
        button: {
          no: "לא",
          yes: "כן",
        },
        callback: (confirm) => {
          if (confirm) {
            this.deleteScheduler(scheduler);
          }
        },
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
