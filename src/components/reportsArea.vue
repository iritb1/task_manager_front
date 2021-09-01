<template>
  <v-form ref="reportsForm" v-model="valid" lazy-validation>
    <v-row style="margin: 10px">
      <v-col cols="12" sm="3">
        <v-select
          :rules="[validationRules.required]"
          v-model="report_type"
          :items="reports_types"
          item-text="name"
          item-value="id"
          label="סוג דוח"
        ></v-select>
      </v-col>
      <v-col class="d-flex" cols="12" sm="3" v-if="!task">
        <v-text-field
          :rules="[validationRules.positive]"
          label="ימים אחורה (תאריך יצירת משימה)"
          v-model.number="days_back"
          type="number"
        ></v-text-field>
      </v-col>
      <!-- <v-col class="d-flex" cols="12" sm="3" /> -->
      <v-col class="d-flex" cols="12" sm="3">
        <v-btn
          :loading="loading_report"
          style="margin-top: 5px"
          :disabled="!valid"
          color="success"
          @click="downloadReport"
        >
          <v-icon>mdi-plus</v-icon>
          <div>הפק דוח</div>
        </v-btn>
      </v-col>
    </v-row>
  </v-form>
</template>

<script>
import { api } from "../apiConfig";
export default {
  computed: {
    reports_types() {
      if (this.task) {
        if (this.task.isFault) {
          return this.$store.state.config.REPORT_TYPES.filter((report_type) =>
            [
              "general_faults",
              "fault_until_timed",
              "fault_time_inc_out_source",
            ].includes(report_type.id)
          );
        } else {
          return this.$store.state.config.REPORT_TYPES.filter((report_type) =>
            ["general_tasks"].includes(report_type.id)
          );
        }
      } else {
        return this.$store.state.config.REPORT_TYPES;
      }
    },
  },
  data() {
    return {
      loading_report: false,
      report_type: null,
      days_back: 30,
      valid: true,
      validationRules: {
        required: (value) => !!value || "שדה חובה",
        positive: (value) => value > 0 || "חייב להיות ערך חיובי",
        counter1000: (value) => value.length <= 1000 || "עד 1000 תווים",
      },
    };
  },
  props: {
    task: {
      type: Object,
    },
  },
  methods: {
    downloadReport() {
      if (!this.$refs.reportsForm.validate()) {
        return;
      }
      this.loading_report = true;
      var uts = Date.now();
      api
        .get("report/general", {
          params: this.task
            ? {
                report_type: this.report_type,
                id: this.task.id,
              }
            : {
                report_type: this.report_type,
                days_back: this.days_back,
                uts: uts,
              },
          responseType: "blob",
          headers: {
            CacheControl: "no-cache",
            AccessControlAllowOrigin: "*",
          },
        })
        .then(
          (response) => {
            const url = URL.createObjectURL(new Blob([response.data]));
            const link = document.createElement("a");
            link.href = url;
            link.setAttribute(
              "download",
              "דוח " +
                this.$store.state.config.REPORT_TYPES.find(
                  (r) => r.id == this.report_type
                ).name +
                ((this.task ? ` משימה ${this.task.id} ` : "") + ".xlsx")
            );
            document.body.appendChild(link);
            link.click();
            this.loading_report = false;
          },
          // .then(
          //   (response) => {
          //     const url = URL.createObjectURL(
          //       new Blob([response.data], {
          //         type: "application/vnd.ms-excel",
          //       })
          //     );
          //     const link = document.createElement("a");
          //     link.href = url;
          //     link.setAttribute(
          //       "download",
          //       "דוח " +
          //         this.$store.state.config.REPORT_TYPES.find(
          //           (r) => r.id == this.report_type
          //         ).name +
          //         (this.id ? ` משימה ${this.id} ` : "")
          //     );
          //     document.body.appendChild(link);
          //     link.click();
          //     this.loading_report = false;
          //   },
          (error) => {
            this.loading_report = false;
            if (
              !(error.response && [401, 403].includes(error.response.status))
            ) {
              this.$store.dispatch("snackbar/setSnackbar", {
                text: `ארעה שגיאה בהפקת הדוח, אנא נסה שנית`,
                color: "red",
              });
            }
          }
        );
    },
  },
};
</script>

<style>
</style>