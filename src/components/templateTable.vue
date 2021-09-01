<template>
  <div id="Template-Table">
    <div class="templateTable">
      <v-card-title>
        <v-btn class="ml-6 mt-6" color="success" @click="onCreateNewTemplate">
          <div>צור שבלונה</div>
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
        :headers="Headers"
        :items="allTemplates"
        item-key="fatherTask.id"
        show-expand
        :expanded.sync="expanded"
        :single-expand="true"
        :items-per-page="20"
        :loading="!Array.isArray($store.state.tasksTemplates.templates)"
        loading-text="טוען... נא להמתין"
        no-data-text="אין תבניות"
        @click:row="onEventClick"
        locale="he"
        dir="rtl"
        :search="search"
        :footer-props="{
          showCurrentPage: true,
          itemsPerPageOptions: [20, 35, 50, -1],
        }"
      >
        <template v-slot:[`item.actions`]="{ item }">
          <v-tooltip top>
            <template v-slot:activator="{ on, attrs }">
              <v-btn
                v-bind="attrs"
                v-on="on"
                fab
                small
                color="success"
                @click.stop="
                  $root.$emit('call-father-task-dialog', {
                    fatherTaskId: item.fatherTask.id,
                    isTemplate: false,
                    loadFromTemplate: true,
                    editTitle: true,
                  })
                "
              >
                <v-icon>mdi-file-replace-outline</v-icon>
              </v-btn>
            </template>
            <pre class="tab"> צור משימה </pre>
          </v-tooltip>
          <v-tooltip top>
            <template v-slot:activator="{ on, attrs }">
              <v-btn
                v-bind="attrs"
                v-on="on"
                small
                color="error"
                fab
                @click.stop="onDeleteTemplate(item)"
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
    </div>
  </div>
</template>

<script>
import { mapGetters, mapActions } from "vuex";
import { addHours, addDays } from "date-fns";

export default {
  computed: {
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
          value: "fatherTask.id",
          width: "10%",
        },
        { text: "כותרת", value: "fatherTask.title", width: "25%" },
        { text: "תוכן", value: "fatherTask.description", width: "50%" },
        { text: "פעולות", value: "actions", width: "20%" },
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
    ...mapActions("tasksTemplates", ["deleteTemplate", "fetchAlltemplates"]),
    ...mapActions("tasksSchedulers", ["fetchAllTaskSchedulers"]),
    onEventClick(row) {
      this.$root.$emit("call-father-task-dialog", {
        fatherTaskId: row.fatherTask.id,
        isTemplate: true,
        editTitle: true,
      });
    },
    onCreateNewTemplate: function () {
      this.$root.$emit("call-father-task-dialog", {
        fatherTaskId: null,
        isTemplate: true,
        editTitle: true,
      });
    },

    onDeleteTemplate(template) {
      this.$confirm({
        message: `האם אתה רוצה למחוק את התבנית?`,
        button: {
          no: "לא",
          yes: "כן",
        },
        callback: (confirm) => {
          if (confirm) {
            this.deleteTemplate(template);
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
