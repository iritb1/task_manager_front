<template>
  <v-dialog scrollable v-model="toShow">
    <v-form lazy-validation v-show="isLoad" v-model="valid" ref="form-father">
      <v-card>
        <!-- <v-card-title> -->
        <v-toolbar dark :color="isTemplate ? 'green' : 'primary'">
          <v-text-field
            placeholder="הכנס כותרת"
            solo
            flat
            :background-color="isTemplate ? 'green' : 'primary'"
            :rules="[validationRules.required, validationRules.counter100]"
            v-model="formData.fatherTask.title"
            :readonly="!editTitle || formData.fatherTask.locked"
            @change="autoCompleteTitle = false"
            class="title"
            style="width: 70%; margin-top: auto; font-size: 2em !important"
          >
            <template v-slot:append-outer>
              <v-tooltip>
                <template v-slot:activator="{ on, attrs }">
                  <v-slide-x-reverse-transition mode="out-in">
                    <v-btn
                      style="height: 34px; width: 34px; margin-left: 5px"
                      @click="editTitle = !editTitle"
                      :disabled="formData.fatherTask.locked"
                      v-bind="attrs"
                      v-on="on"
                      icon
                    >
                      <v-icon
                        :color="
                          !editTitle || formData.fatherTask.locked
                            ? 'info'
                            : 'success'
                        "
                        v-text="
                          !editTitle || formData.fatherTask.locked
                            ? 'mdi-circle-edit-outline'
                            : 'mdi-check-outline'
                        "
                      ></v-icon>
                    </v-btn>
                  </v-slide-x-reverse-transition>
                </template>
                <span v-if="editTitle"> סיים עריכת כותרת </span>
                <span v-else> ערוך כותרת </span>
              </v-tooltip>
            </template>
          </v-text-field>
          <!-- <v-spacer></v-spacer> -->
          <v-icon
            style="padding-right: 10px"
            v-if="formData.fatherTask.locked"
            color="red"
            >lock</v-icon
          >
          <v-tooltip top>
            <template v-slot:activator="{ on, attrs }">
              <div v-bind="attrs" v-on="on">
                <v-switch
                  style="margin-top: 1.4em; padding-right: 15px"
                  v-model="formData.fatherTask.locked"
                  color="red"
                ></v-switch>
              </div>
            </template>
            <div v-if="formData.fatherTask.locked">שחרר נעילת משימת אב</div>
            <div v-else>נעל משימת אב</div>
          </v-tooltip>

          <v-tooltip top>
            <template v-slot:activator="{ on, attrs }">
              <v-btn v-bind="attrs" v-on="on" icon dark @click="toShow = false">
                <v-icon>mdi-close</v-icon>
              </v-btn>
            </template>
            <span> סגור </span>
          </v-tooltip>
          <v-tooltip top v-if="!isTemplate && !fatherTaskId">
            <template v-slot:activator="{ on: onTooltip, attrs: attrsTooltip }">
              <v-menu offset-y>
                <template v-slot:activator="{ on, attrs }">
                  <v-btn
                    v-bind="{ ...attrs, ...attrsTooltip }"
                    v-on="{ ...on, ...onTooltip }"
                    icon
                    dark
                  >
                    <v-icon>mdi-file-replace-outline</v-icon>
                  </v-btn>
                </template>
                <v-list style="max-height: 70vh; overflow-y: scroll">
                  <v-list-item
                    v-for="template in allTemplates"
                    :key="template.fatherTask.id"
                    link
                    @click="loadTemplate(template)"
                  >
                    <v-list-item-title
                      v-text="template.fatherTask.title"
                    ></v-list-item-title>
                  </v-list-item>
                </v-list>
              </v-menu>
            </template>
            <span> טען משבלונה </span>
          </v-tooltip>
          <v-tooltip top v-if="!isTemplate">
            <template v-slot:activator="{ on, attrs }">
              <v-btn
                style="min-width: 0; width: 45px; margin-left: 5px"
                :disabled="!valid"
                v-bind="attrs"
                v-on="on"
                dark
                text
                @click="onTemplateSave"
              >
                <v-icon>mdi-sticker-plus-outline</v-icon></v-btn
              >
            </template>
            <span> צור שבלונה וסגור </span>
          </v-tooltip>

          <v-tooltip top>
            <template v-slot:activator="{ on, attrs }">
              <v-btn
                style="min-width: 0; width: 40px"
                v-bind="attrs"
                v-on="on"
                :disabled="!valid || !computedisEdited"
                dark
                text
                @click="onSave"
                ><v-icon>save</v-icon></v-btn
              >
            </template>
            <div v-if="fatherTaskId">שמור הכל וסגור</div>
            <div v-else-if="isTemplate">צור שבלונה וסגור</div>
            <div v-else>צור משימה וסגור</div>
          </v-tooltip>
        </v-toolbar>
        <v-card-text class="pa-0" ref="content">
          <v-container class="grey lighten-5" fluid>
            <v-row>
              <v-col class="text-center" cols="5">
                <h3>תיאור</h3>
                <v-textarea
                  :disabled="formData.fatherTask.locked"
                  :rules="[validationRules.counter1000]"
                  solo
                  v-model="formData.fatherTask.description"
                ></v-textarea>
              </v-col>

              <v-col class="text-center" cols="7">
                <v-row>
                  <v-col cols="4">
                    <h3>מנהל</h3>
                    <v-autocomplete
                      :disabled="
                        formData.fatherTask.locked ||
                        (formData.fatherTask.id != null &&
                          savedData &&
                          savedData.fatherTask.manager !=
                            $store.state.userData.uid &&
                          !$store.state.userData.permissions.includes(
                            'ADMIN'
                          ) &&
                          !$store.state.userData.permissions.includes('LEAD'))
                      "
                      v-model="formData.fatherTask.manager"
                      :items="$store.state.metadata.persons"
                      item-text="name"
                      item-value="id"
                      deletable-chips
                      hide-no-data
                      chips
                      solo
                    >
                      <template v-slot:item="data">
                        <template v-if="typeof data.item !== 'object'">
                          <v-list-item-content
                            v-text="data.item"
                          ></v-list-item-content>
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
                  </v-col>
                  <v-col cols="4">
                    <h3>סטטוס</h3>
                    <v-btn-toggle :value="formData.fatherTask.status_id">
                      <v-btn
                        class="disable-events"
                        :disabled="!formData.fatherTask.id || isTemplate"
                        v-for="status in statuses"
                        :key="status.id"
                        :value="status.id"
                        :style="{
                          color:
                            status.id == statuses[0].id
                              ? '#4083ff'
                              : status.id == statuses[1].id
                              ? 'orange'
                              : '#4CAF50',
                        }"
                      >
                        {{ status.name }}<br />
                        {{ formData.tasks.length }}/
                        {{
                          formData.tasks.filter(
                            (task) => task.status_id == status.id
                          ).length
                        }}
                      </v-btn>
                    </v-btn-toggle>
                  </v-col>
                  <v-col cols="4">
                    <h3>חובה להשלים משימות ע''פ הסדר</h3>
                    <v-switch
                      style="margin-right: auto; margin-left: auto; width: 40px"
                      v-model="formData.fatherTask.complete_by_order"
                      color="primary"
                      :disabled="formData.fatherTask.locked"
                    ></v-switch
                  ></v-col>
                </v-row>
                <v-row>
                  <v-col cols="4">
                    <h3>דדליין</h3>
                    <v-menu
                      v-model="deadlineMenu"
                      transition="scale-transition"
                      :close-on-content-click="false"
                    >
                      <template v-slot:activator="{ on, attrs }">
                        <v-text-field
                          :disabled="formData.fatherTask.locked || isTemplate"
                          class="deadline"
                          v-model="computedDeadLineFormatted"
                          prepend-icon="event"
                          readonly
                          v-bind="attrs"
                          v-on="on"
                        ></v-text-field>
                      </template>
                      <v-card>
                        <v-card-text class="px-0 py-0">
                          <v-date-picker
                            :min="minDeadlineDate"
                            scrollable
                            locale="he-IL"
                            v-model="formData.fatherTask.deadline"
                            @input="deadlineMenu = false"
                          ></v-date-picker>
                        </v-card-text>
                        <v-card-actions>
                          <slot name="actions" :parent="this">
                            <v-btn
                              color="grey lighten-1"
                              text
                              @click="
                                deadlineMenu = false;
                                formData.fatherTask.deadline = null;
                              "
                              >נקה</v-btn
                            >
                          </slot>
                        </v-card-actions>
                      </v-card>
                    </v-menu></v-col
                  >
                  <v-col cols="4">
                    <h3>תאריך סיום בפועל</h3>
                    <v-text-field
                      :disabled="isTemplate"
                      class="deadline"
                      :value="computedCompletedDateFormatted"
                      prepend-icon="event"
                      readonly
                    ></v-text-field
                  ></v-col>
                  <v-col cols="2">
                    <div v-if="formData.fatherTask.id" class="mt-6">
                      נוצר על יד:{{ " " + formData.fatherTask.creator }}
                    </div></v-col
                  >
                  <v-col cols="2"
                    ><div v-if="formData.fatherTask.id" class="mt-6">
                      בתאריך:{{ " " + formData.fatherTask.creation_time }}
                    </div></v-col
                  >
                </v-row>
              </v-col>
            </v-row>
            <!-- <v-row
              style="margin-top: -20px; margin-bottom: -20px"
              class="text-center"
              ><v-col cols="3">
                <div v-if="formData.fatherTask.id">
                  נוצר על יד:{{ " " + formData.fatherTask.creator }}
                </div></v-col
              >
              <v-col cols="3"
                ><div v-if="formData.fatherTask.id">
                  בתאריך:{{ " " + formData.fatherTask.creation_time }}
                </div></v-col
              >
            </v-row> -->
            <!-- <br /> -->
            <v-row justify="center">
              <h2 style="text-decoration: underline; margin-bottom: 10px">
                משימות
              </h2>
            </v-row>
            <taskCard
              v-for="(task, index) in formData.tasks"
              :key="task.id"
              class="mb-10"
              v-model="formData.tasks[index]"
              :fatherTaskDeadline="formData.fatherTask.deadline"
              :locked="formData.fatherTask.locked"
              @on-task-save="onTaskSave"
              @on-task-copy="onTaskCopy"
              @on-task-delete="onTaskDelete"
            ></taskCard>
            <v-row
              justify="center"
              v-if="formData['tasks'][formData['tasks'].length - 1]"
            >
              <v-col cols="12" class="text-center">
                <v-btn
                  :class="{ 'disable-events': formData.fatherTask.locked }"
                  :color="formData.fatherTask.locked ? 'grey' : 'success'"
                  fab
                  large
                  dark
                  @click="onAddTask(formData.fatherTask.id, isTemplate)"
                >
                  <v-icon>mdi-plus</v-icon>
                </v-btn>
              </v-col>
            </v-row>
          </v-container>
        </v-card-text>
      </v-card>
    </v-form>
    <v-card color="primary" dark v-show="!isLoad">
      <v-card-text>
        טוען נתונים
        <v-progress-linear
          indeterminate
          color="white"
          class="mb-0"
        ></v-progress-linear>
      </v-card-text>
    </v-card>
  </v-dialog>
</template>

<script>
import moment from "moment";
import { mapGetters, mapActions } from "vuex";
import taskCard from "./taskCard";

import axios from "axios";

// import { tr } from "date-fns/locale";
import _ from "lodash";
import { th } from "date-fns/locale";
import { max, sub } from "date-fns";
// import { th } from "date-fns/locale";

export default {
  components: { taskCard },
  computed: {
    ...mapGetters(["getFatherTaskWithChilds", "getFatherTask", "getTask"]),
    ...mapGetters("metadata", [
      "domains",
      "taskTypes",
      "urgencies",
      "statuses",
      "allStaffByDomains",
    ]),
    ...mapGetters("tasksTemplates", ["allTemplates", "getTemplateByFatherId"]),
    computedMaxPriority() {
      let maxPriority = 0;
      this.formData.tasks.forEach((task) => {
        if (task.priority > maxPriority) {
          maxPriority = task.priority;
        }
      });
      return maxPriority;
    },
    fatherTaskStatus() {
      return this.savedData ? this.savedData.fatherTask.status_id : null;
    },
    firstTaskTitle() {
      if (this.formData.tasks.length > 0) {
        return this.formData.tasks[0].title;
      } else {
        return "";
      }
    },
    minDeadlineDate() {
      let minDate = new Date();
      var tomorrowDate = minDate.getDate() + 1;
      minDate.setDate(tomorrowDate);
      this.formData.tasks.forEach((task) => {
        // if (task.deadline) {
        //   let formatedTaskDeadline = new Date(task.deadline);
        //   if (minDate < formatedTaskDeadline) {
        //     minDate = formatedTaskDeadline;
        //   }
        // } else {
        if (task.end) {
          if (minDate < task.end) {
            minDate = task.end;
          }
        }
      });
      return minDate.toISOString();
    },
    savedData() {
      if (this.isTemplate) {
        return this.getTemplateByFatherId(this.fatherTaskId);
      } else {
        return this.getFatherTaskWithChilds(this.fatherTaskId);
      }
    },
    computedisEdited() {
      return JSON.stringify(this.formData) !== JSON.stringify(this.savedData);
    },
    // return deadline formated (dd-mm-yyyy)
    computedDeadLineFormatted() {
      return this.formatDate(this.formData.fatherTask.deadline);
    },
    computedCompletedDateFormatted() {
      return this.formatDate(this.formData.fatherTask.completed_date);
    },
  },
  data() {
    return {
      formData: {
        fatherTask: { title: "", description: "" },
        tasks: [],
      },
      isTemplate: null,
      fatherTaskId: null,
      deadlineMenu: false,
      toShow: false,
      isLoad: false,
      valid: true,
      editTitle: false,
      autoCompleteTitle: false,

      validationRules: {
        required: (value) => !!value || "שדה חובה",
        counter100: (value) => value.length <= 100 || "עד 100 תווים",
        counter1000: (value) => value.length <= 1000 || "עד 1000 תווים",
      },
    };
  },
  methods: {
    ...mapActions([
      "updateFatherTask",
      "updateTaskAsync",
      "createTask",
      "createFatherTask",
      "deleteTask",
      "updateFatherTaskStatus",
    ]),
    onAddTask(fatherTaskId, isTemplate) {
      if (this.formData["tasks"][this.formData["tasks"].length - 1].id > 0) {
        this.formData.tasks.push(
          this.createBlankTask(fatherTaskId, isTemplate)
        );
      } else {
        this.$store.dispatch("snackbar/setSnackbar", {
          color: "orange",
          text: `משימה חדשה קודמת עוד לא נשמרה`,
        });
      }
    },
    validateTaskPriorities(updatedTaskIndex = null) {
      let tasks = [];
      if (updatedTaskIndex != null) {
        // cheking validating by saved data (maybe current form changed wont be saved,
        if (this.savedData.fatherTask.complete_by_order == false) return true;
        tasks = [...this.savedData.tasks];
        tasks[updatedTaskIndex] = this.formData.tasks[updatedTaskIndex];
      } else {
        //if all all from is saved form tasks can be referred as source of truth
        if (this.formData.fatherTask.complete_by_order == false) return true;
        tasks = [...this.formData.tasks];
      }
      //sort to relavt order (by relevant priorities)
      tasks.sort(function (a, b) {
        return a.priority - b.priority;
      });
      let unFinishedIndex = this.formData.tasks.length - 1;
      for (let i = 0; i < tasks.length; ++i) {
        if (tasks[i].status_id != 3) {
          unFinishedIndex = i;
        } else {
          if (unFinishedIndex < i) {
            this.$store.dispatch("snackbar/setSnackbar", {
              color: "red",
              text: `לא ניתן להשלים את משימה @ לפני שמשימה @ הושלמה`,
              param: tasks[i].title,
              param2: tasks[unFinishedIndex].title,
            });
            return false;
          }
        }
      }
      return true;
    },

    /**
     *create new blank task
     *
     * @param {object} isTemplate - if task is template
     * @return {object} task (blank)
     */
    createBlankTask(father_id, isTemplate) {
      let id;
      for (;;) {
        id = -(Math.floor(Math.random() * 100) + 1);
        if (!this.formData.tasks.map((task) => task.id).includes(id)) {
          break;
        }
      }
      return {
        id: id,
        father_id: father_id,
        title: "",
        description: "",
        status_id: 1,
        urgency_id: 2,
        priority: this.computedMaxPriority + 1,
        crew: [],
        files_url: [],
        plannings: [],
        building: {},
        equipment: [],
        check_list: [],
        fault_data: null,
        file_required: false,
        type_id: 1,
        domain_id: this.$store.state.userData.domain_id
          ? this.$store.state.userData.domain_id
          : this.$store.state.metadata.domains[0],
        start: null,
        end: null,
        deadline: this.formData.fatherTask.deadline,
        creation_time: "",
        creator_id: this.$store.state.userData.uid,
        is_template: isTemplate,
        background: false,
        editable:
          this.$store.state.userData.permissions.includes("ADMIN") ||
          this.$store.state.userData.permissions.includes("LEAD"),
      };
    },
    //format Date object to dd/MM/YYYY string
    formatDate(date) {
      if (!date) return null;

      const [year, month, day] = date.split("-");
      return `${day}/${month}/${year}`;
    },
    onSave: function () {
      if (!this.validateAllForm()) {
        return;
      }
      if (!this.validateTaskPriorities()) {
        return;
      }
      const descendants =
        this.$children[0].$children[0].$children[0].$children[0].$children.filter(
          (child) => "form" in child.$refs
        );
      if (this.formData.fatherTask.id) {
        if (
          JSON.stringify(this.formData.fatherTask) !==
          JSON.stringify(this.savedData.fatherTask)
        ) {
          this.updateFatherTask(this.formData.fatherTask);
        }
        descendants.forEach((descendant) => {
          if (descendant.computedIsEdited) {
            descendant.onSave(false);
          }
        });
      } else {
        var self = this;
        this.createFatherTask(this.formData.fatherTask).then(
          (fetchedFatherTask) => {
            self.formData.fatherTask = _.cloneDeep(fetchedFatherTask);
            self.fatherTaskId = fetchedFatherTask.id;
            self.formData.tasks.forEach(
              (task) => (task.father_id = fetchedFatherTask.id)
            );
            descendants.forEach((descendant) => {
              descendant.onSave(false);
            });
          }
        );
      }
      this.toShow = false;
    },

    onTaskSave: async function (id, validatePriorities = true) {
      let fetchedTask;
      let updateFatherStatus = false;
      let updTaskIndex = this.formData.tasks.findIndex((task) => task.id == id);
      if (validatePriorities) {
        if (!this.validateTaskPriorities(updTaskIndex)) {
          return;
        }
      }
      let updTask = this.formData.tasks[updTaskIndex];
      if (id > 0 && !updTask.newTemplate) {
        if (
          this.getTask(id) &&
          !updTask.is_template &&
          this.getTask(id).status_id != updTask.status_id
        ) {
          updateFatherStatus = true;
        }
        try {
          fetchedTask = await this.updateTaskAsync(updTask);
        } catch (error) {
          if (error.response.status == 404) {
            if (this.getTask(id)) {
              this.$store.commit("deleteTask", id);
            }
            this.updateFatherTaskStatus(this.formData.fatherTask).then(
              (response) => {
                if (response.updated) {
                  this.$root.$emit("call-father-task-dialog", {
                    fatherTaskId: this.fatherTaskId,
                    isTemplate: this.isTemplate,
                  });
                }
              }
            );
          }
          this.$root.$emit("call-father-task-dialog", {
            fatherTaskId: this.fatherTaskId,
            isTemplate: this.isTemplate,
          });
          return;
        }
      } else {
        //new task
        if (!updTask.is_template) {
          updateFatherStatus = true;
        }
        try {
          fetchedTask = await this.createTask(updTask);
        } catch (err) {
          return;
        }
      }
      if (updateFatherStatus) {
        this.updateFatherTaskStatus(this.formData.fatherTask).then(
          (response) => {
            if (response.updated) {
              this.formData.fatherTask = response.father_task;
            }
          }
        );
      }
      let unsavedTasks = this.formData.tasks.filter(
        (task) => task.id < 0 && task.id != id
      );
      this.formData.tasks = this.savedData.tasks
        .map((task) => {
          if (task.id == fetchedTask.id) {
            return _.cloneDeep(fetchedTask);
          } else {
            return this.formData.tasks.find(
              (formTask) => formTask.id == task.id
            );
          }
        })
        .concat(unsavedTasks);
    },
    onTaskCopy(id) {
      for (const [index, task] of this.formData.tasks.entries()) {
        if (task.id === id) {
          let id;
          for (;;) {
            id = -(Math.floor(Math.random() * 100) + 1);
            if (!this.formData.tasks.map((task) => task.id).includes(id)) {
              break;
            }
          }
          let copiedTask = _.cloneDeep(task);
          copiedTask.id = id;
          copiedTask.title = copiedTask.title + " - העתק";
          copiedTask.start = null;
          copiedTask.end = null;
          this.formData.tasks.splice(index + 1, 0, copiedTask);
          break;
        }
      }
    },
    onTaskDelete(delTask) {
      this.$confirm({
        message: `האם אתה רוצה למחוק את המשימה?`,
        button: {
          no: "לא",
          yes: "כן",
        },
        callback: (confirm) => {
          if (confirm) {
            if (delTask.id > 0) {
              this.deleteTask(delTask).then((response) => {
                this.formData.tasks = this.formData.tasks.filter(
                  (task) => task.id !== delTask.id
                );
                if (!this.isTemplate) {
                  this.updateFatherTaskStatus(this.formData.fatherTask).then(
                    (response) => {
                      if (response.updated) {
                        this.formData.fatherTask = response.father_task;
                      }
                    }
                  );
                }
              });
            } else {
              this.formData.tasks = this.formData.tasks.filter(
                (task) => task.id !== delTask.id
              );
            }
          }
        },
      });
    },
    onTemplateSave() {
      if (!this.validateAllForm()) {
        return;
      }
      this.fatherTaskId = null;
      this.isTemplate = true;
      this.formData.fatherTask.id = null;
      this.formData.fatherTask.deadline = null;
      this.formData.fatherTask.completed_date = null;
      this.formData.fatherTask.is_template = true;
      this.formData.tasks.forEach(function (task, index, tasks) {
        tasks[index].is_template = true;
        tasks[index].newTemplate = true;
        tasks[index].deadline = null;
        tasks[index].start = null;
        tasks[index].end = null;
        tasks[index].status_id = 1;
        tasks[index].check_list.forEach((subTask) => (subTask[1] = false));
      });

      this.onSave();
    },
    loadTemplate(template) {
      this.autoCompleteTitle = false;
      template = _.cloneDeep(template);
      template.fatherTask.is_template = false;
      template.fatherTask.id = null;
      template.fatherTask.creator_id = this.$store.state.userData.uid;
      template.tasks = template.tasks.map((task) => {
        task.id = task.id * -1;
        task.father_id = null;
        task.is_template = false;
        task.creator_id = this.$store.state.userData.uid;
        return task;
      });

      this.editTitle = true;
      this.formData = _.cloneDeep(template);
    },
    /**
     *check if all the from is valid.
     *
     * @return true/false
     */
    validateAllForm: function () {
      if (!this.$refs["form-father"].validate()) {
        this.$store.dispatch("snackbar/setSnackbar", {
          color: "red",
          text: `חובה למלא כותרת למשימת אב`,
        });
        return false;
      }
      const descendants =
        this.$children[0].$children[0].$children[0].$children[0].$children.filter(
          (child) => "form" in child.$refs
        );
      let tasksValid = true;
      descendants.forEach((descendant, index) => {
        if (!descendant.$refs.form.validate()) {
          const title = descendant.$options.propsData.value.title;
          if (title == "") {
            this.$store.dispatch("snackbar/setSnackbar", {
              color: "red",
              text: `חסר כותרת במשימה מספר `,
              param: index + 1,
            });
          } else {
            this.$store.dispatch("snackbar/setSnackbar", {
              color: "red",
              text: `טופס לא תקין במשימה  `,
              param: title,
            });
          }
          tasksValid = false;
        }
      });
      return tasksValid;
    },
  },
  beforeDestroy: function () {
    this.$root.$off("close-father-task-dialog");
  },
  mounted: function () {
    this.$root.$on("close-father-task-dialog", () => {
      this.toShow = false;
    });
    this.$root.$on(
      "call-father-task-dialog",
      ({
        fatherTaskId = null,
        isTemplate = false,
        loadFromTemplate = false,
        range = null,
        editTitle = false,
        taskId = null,
      }) => {
        this.isLoad = false;
        this.toShow = true;
        this.fatherTaskId = fatherTaskId;
        this.isTemplate = isTemplate;
        this.editTitle = editTitle;
        const self = this;
        this.$nextTick(function () {
          setTimeout(function () {
            if (loadFromTemplate) {
              let template = self.$store.state.tasksTemplates.templates.find(
                (temp) => temp.fatherTask.id == fatherTaskId
              );
              self.loadTemplate(template);
              self.isLoad = true;
              self.toShow = true;

              return;
            }
            if (fatherTaskId) {
              self.autoCompleteTitle = false;
              if (self.savedData == undefined) {
                self.$store.dispatch("snackbar/setSnackbar", {
                  color: "red",
                  text: `המשימה לא נמצאה`,
                  timeout: 6000,
                });
                self.toShow = false;
                return;
              }
              self.formData = _.cloneDeep(self.savedData);
            } else {
              self.formData = {
                fatherTask: {
                  title: "",
                  description: "",
                  manager: self.$store.state.userData.uid,
                  complete_by_order: false,
                  deadline: null,
                  locked: false,
                  is_template: isTemplate,
                  creator_id: self.$store.state.userData.uid,
                  creation_time: "",
                },
                tasks: [],
              };
              self.formData.tasks.push(self.createBlankTask(null, isTemplate));

              self.autoCompleteTitle = true;
              if (range) {
                self.formData.tasks[0] = Object.assign(
                  self.formData.tasks[0],
                  range
                );
              }
            }
            self.isLoad = true;

            self.$nextTick(function () {
              let pixelsToScroll;
              if (taskId) {
                let taskIndex = self.formData.tasks.findIndex(
                  (task) => task.id == taskId
                );
                pixelsToScroll = 200 + 580 * taskIndex;
              } else {
                pixelsToScroll = 0;
              }
              let content = self.$refs.content;
              content.scrollTop = pixelsToScroll;
            });
          }, 0);
        });
      }
    );
  },
  watch: {
    // fatherTaskStatus: function (newVal, oldVal) {

    //   if (oldVal) {
    //     this.formData.fatherTask.status_id = newVal;
    //     if (
    //       newVal == this.statuses[2].id &&
    //       [this.statuses[0].id, this.statuses[1].id].includes(oldVal)
    //     ) {
    //       let completedDate = new Date().toISOString().slice(0, 10);
    //       this.formData.fatherTask.completed_date = completedDate;
    //       this.updateFatherTask(this.formData.fatherTask).then((fatherTask) =>

    //       );
    //     }
    //   }
    // },
    firstTaskTitle: function (newVal, oldVal) {
      if (this.autoCompleteTitle) {
        this.formData.fatherTask.title = newVal;
      }
    },
    "formData.fatherTask.deadline": {
      immediate: false,
      handler(newVal, oldVal) {
        if (newVal) {
          this.formData.tasks.forEach((task) => {
            if (!task.deadline || new Date(task.deadline) > new Date(newVal)) {
              task.deadline = newVal;
            }
          });
        }
      },
    },
  },
};
</script>

<style computed>
.title .v-messages {
  margin-top: 10px;
}

.deadline {
  /* direction: ltr;
  width: 160px;
  margin-top: 10px;
  padding-top: 0; */
  direction: ltr;
  width: 122px;
  margin-right: auto;
  margin-left: auto;
  margin-top: 10px;
  padding-top: 0;
}

.deadline .v-input__icon--prepend .v-icon {
  color: #1976d2;
}

.disable-events {
  pointer-events: none;
}
</style>
