<template>
  <v-dialog scrollable v-model="toShow" persistent>
    <v-form lazy-validation v-show="isLoad" v-model="valid" ref="form-father">
      <v-card>
        <v-toolbar dark color="orange">
          <v-autocomplete
            :rules="[validationRules.required]"
            label="שבלונה"
            flat
            filled
            background-color="orange"
            v-model="formData.template_father_task_id"
            :items="allTemplates"
            item-value="fatherTask.id"
            item-text="fatherTask.title"
            :readonly="!editTemplate"
            class="title"
            style="width: 80%; margin-top: auto; font-size: 2em !important"
          >
            <template v-slot:append-outer>
              <v-tooltip top>
                <template v-slot:activator="{ on, attrs }">
                  <v-slide-x-reverse-transition mode="out-in">
                    <v-btn
                      style="padding-bottom: 12px"
                      @click="editTemplate = !editTemplate"
                      v-bind="attrs"
                      v-on="on"
                      icon
                    >
                      <v-icon
                        :color="editTemplate ? 'success' : 'info'"
                        v-text="
                          editTemplate
                            ? 'mdi-check-outline'
                            : 'mdi-circle-edit-outline'
                        "
                      ></v-icon>
                    </v-btn>
                  </v-slide-x-reverse-transition>
                </template>
                <span v-if="editTemplate"> סיים עריכת תבנית </span>
                <span v-else> ערוך תבנית </span>
              </v-tooltip>
            </template>
          </v-autocomplete>
          <v-spacer></v-spacer>
          <v-tooltip top>
            <template v-slot:activator="{ on, attrs }">
              <v-btn v-bind="attrs" v-on="on" icon dark @click="toShow = false">
                <v-icon>mdi-close</v-icon>
              </v-btn>
            </template>
            <span> סגור </span>
          </v-tooltip>
          <v-tooltip top>
            <template v-slot:activator="{ on, attrs }">
              <v-btn
                v-bind="attrs"
                v-on="on"
                :disabled="!valid || !computedisEdited"
                dark
                text
                @click="onSave"
                ><v-icon>save</v-icon></v-btn
              >
            </template>
            <div v-if="formData.id">שמור הכל וסגור</div>
            <div v-else>צור תזמון וסגור</div>
          </v-tooltip>
        </v-toolbar>
        <v-card-text class="pa-0">
          <v-container class="grey lighten-5" fluid>
            <v-row>
              <v-col class="text-center" cols="4" sm="4">
                <h3>תאריך התחלה</h3>
                <v-menu
                  v-model="startMenu"
                  transition="scale-transition"
                  :close-on-content-click="false"
                >
                  <template v-slot:activator="{ on, attrs }">
                    <v-text-field
                      :rules="[validationRules.required, validateStart]"
                      class="deadline"
                      :value="formatDate(formData.start_date)"
                      prepend-icon="event"
                      readonly
                      v-bind="attrs"
                      v-on="on"
                    ></v-text-field>
                  </template>
                  <v-date-picker
                    :min="tomorrow"
                    scrollable
                    locale="he-IL"
                    v-model="formData.start_date"
                    @input="startMenu = false"
                  ></v-date-picker>
                </v-menu>
              </v-col>
              <v-col class="text-center" cols="4" sm="4">
                <h3>תאריך סיום</h3>

                <v-menu
                  v-model="endMenu"
                  transition="scale-transition"
                  :close-on-content-click="false"
                >
                  <template v-slot:activator="{ on, attrs }">
                    <v-text-field
                      class="deadline"
                      :value="formatDate(formData.end_date)"
                      prepend-icon="event"
                      readonly
                      v-bind="attrs"
                      v-on="on"
                    ></v-text-field>
                  </template>
                  <v-date-picker
                    :min="tomorrow"
                    scrollable
                    locale="he-IL"
                    v-model="formData.end_date"
                    @input="endMenu = false"
                  >
                    <v-btn
                      text
                      color="primary"
                      @click="
                        formData.end_date = null;
                        endMenu = false;
                      "
                    >
                      נקה
                    </v-btn>
                  </v-date-picker>
                </v-menu>
              </v-col>
              <v-col class="text-center" cols="4" sm="4">
                <div v-if="!computedisEdited && !formData.next_date">
                  <h3>התזמון פג תוקף</h3>
                </div>
                <div v-else>
                  <h3>תאריך הבא</h3>
                  <v-text-field
                    class="deadline"
                    :value="formatDate(formData.next_date)"
                    prepend-icon="event"
                    readonly
                    :disabled="computedisEdited"
                  ></v-text-field>
                </div>
              </v-col>
            </v-row>
            <v-row>
              <v-col class="text-center" cols="4" sm="4">
                <h3>סוג תזמון</h3>
                <v-select
                  :rules="[validationRules.required]"
                  v-model="formData.freq"
                  solo
                  class="rtl"
                  :items="frequencies"
                ></v-select>
              </v-col>
              <v-col class="text-center" cols="4" sm="4">
                <h3>מתרחש כל</h3>
                <v-text-field
                  :rules="[validationRules.required]"
                  :label="interval_value_label[formData.freq]"
                  v-model.number="formData.interval_value"
                  type="number"
                ></v-text-field>
              </v-col>
              <v-col
                class="text-center"
                cols="4"
                v-if="formData.freq == 1 || formData.freq == 2"
              >
                <h3>
                  <div v-if="formData.freq == 1">ימים בחודש</div>
                  <div v-if="formData.freq == 2">ימים בשבוע</div>
                </h3>
                <v-autocomplete
                  :rules="[validationRules.required]"
                  v-model="formData.specific_value"
                  :items="
                    formData.freq == 1
                      ? Array.from({ length: 31 }, (x, i) => i + 1)
                      : weekdays
                  "
                  chips
                  placeholder="בחר ימים"
                  multiple
                  solo
                ></v-autocomplete>
              </v-col>
            </v-row>
            <v-row
              v-if="!computedisEdited && formData.next_date"
              justify="center"
            >
              <h2 style="text-decoration: underline; margin-bottom: 10px">
                תאריכים הבאים
              </h2>
            </v-row>
            <v-row v-if="!computedisEdited">
              <v-col
                v-for="(date, key) in formData.next_dates.filter(
                  (value, key) => key != 0
                )"
                :key="key"
                class="text-center"
                cols="2"
                sm="2"
              >
                <h3>{{ key + 2 }}</h3>
                <v-text-field
                  class="deadline"
                  :value="formatDate(date)"
                  prepend-icon="event"
                  readonly
                ></v-text-field>
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
import { tr } from "date-fns/locale";

export default {
  computed: {
    ...mapGetters("tasksSchedulers", ["getScheduler"]),
    ...mapGetters("tasksTemplates", ["allTemplates"]),
    computedDeadLineFormatted() {
      return this.formatDate(this.formData.fatherTask.deadline);
    },
    savedData() {
      return this.getScheduler(this.id);
    },
    computedisEdited() {
      return JSON.stringify(this.formData) !== JSON.stringify(this.savedData);
    },
    tomorrow() {
      var d = new Date();
      var tomorrowDate = d.getDate() + 1;
      d.setDate(tomorrowDate);
      return d.toISOString();
    },
  },
  data() {
    return {
      formData: {},
      id: null,
      editTemplate: false,
      toShow: false,
      isLoad: false,
      valid: true,
      startMenu: false,
      endMenu: false,
      frequencies: [
        { value: 0, text: "שנתי" },
        { value: 1, text: "חודשי" },
        { value: 2, text: "שבועי" },
        { value: 3, text: "יומי" },
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
      interval_value_label: { 0: "שנים", 1: "חודשים", 2: "שבועות", 3: "ימים" },
      validationRules: {
        required: (value) => {
          if (value || value == 0) {
            return true;
          }
          return "שדה חובה";
        },
        counter100: (value) => value.length <= 100 || "עד 100 תווים",
        counter1000: (value) => value.length <= 1000 || "עד 1000 תווים",
      },
    };
  },
  methods: {
    ...mapActions("tasksSchedulers", [
      "createScheduler",
      "updateScheduler",
      "deleteScheduler",
    ]),
    formatDate(date) {
      if (!date) return null;

      const [year, month, day] = date.split("-");
      return `${day}/${month}/${year}`;
    },
    onSave: function () {
      if (!this.$refs["form-father"].validate()) {
        this.$store.dispatch("snackbar/setSnackbar", {
          color: "red",
          text: `טופס לא תקין`,
        });
        return;
      }
      delete this.formData.next_dates;
      if (this.formData.id) {
        this.updateScheduler(this.formData);
      } else {
        this.createScheduler(this.formData);
      }
      this.toShow = false;
    },
    validateStart(value) {
      if (this.formData.end_date != null) {
        const start = new Date(this.formData.start_date);
        const end = new Date(this.formData.end_date);
        if (start >= end) {
          return "התחלה אחרי סיום";
        }
      }
      return true;
    },
  },
  watch: {
    "formData.freq": function (newFreq) {
      if (this.formData.id) {
        if (this.formData.freq == this.savedData.freq) {
          this.formData.specific_value = this.savedData.specific_value;
          return;
        }
      }
      this.formData.specific_value = null;
    },
    "formData.start_date": function (newStart) {
      this.$refs["form-father"].validate();
    },
    "formData.end_date": function (newEnd) {
      this.$refs["form-father"].validate();
    },
  },

  mounted: function () {
    this.$root.$on("close-task-scheduler-dialog", () => {
      this.toShow = false;
    });
    this.$root.$on("call-task-scheduler-dialog", (id) => {
      this.isLoad = false;
      this.toShow = true;
      this.id = id;
      const self = this;
      this.$nextTick(function () {
        setTimeout(function () {
          if (id) {
            // if (self.savedData == undefined) {
            //   self.$store.dispatch("snackbar/setSnackbar", {
            //     color: "red",
            //     text: `התזמון לא נמצא`,
            //     timeout: 6000,
            //   });
            //   self.toShow = false;
            //   return;
            // }
            self.formData = _.cloneDeep(self.savedData);
          } else {
            self.editTemplate = true;
            self.formData = {
              end_date: null,
              creator_id: self.$store.state.userData.uid,
              start_date: self.tomorrow.substring(0, 10),
            };
          }
          self.isLoad = true;
        }, 0);
      });
    });
  },
};
</script>

<style computed>
.title .v-messages {
  margin-top: 10px;
}
</style>
