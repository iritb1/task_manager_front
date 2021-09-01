<template>
  <div>
    <fusioncharts
      :type="type"
      :width="width"
      :height="height"
      :dataformat="dataFormat"
      :dataSource="dataSource"
    >
    </fusioncharts>
  </div>
</template>

<script>
import { mapGetters, mapActions } from "vuex";
export default {
  computed: {
    ...mapGetters(["filterTasks", "getTask", "getFatherTaskWithChilds"]),
    ...mapGetters("metadata", ["allStaff"]),
    dataSource() {
      let fatherTask = this.getFatherTaskWithChilds(this.selectedFatherTaskId);
      let deadline = fatherTask.fatherTask.deadline
      let tasks = fatherTask.tasks.map((task) => {
        // return {
        //   start: task.start,
        //   end: task.end,
        //   processid: task.priority,
        //   label: task.title,
        //   color: task.color,
        //   id: task.id,
        // };
        return {
          label: task.title,
          processid: task.priority,
          start: task.start.toISOString(),
          end: task.end.toISOString(),
          color: task.color,
          id: task.id,
        };
      });

      let process = fatherTask.tasks.map((task) => {
        return {
          label: task.title,
          id: task.priority.toString(),
        };
      });

      let dates = [];
      fatherTask.tasks.forEach((task) => {
        if (task.start) dates.push(task.start);
        if (task.end) dates.push(task.start);
        if (task.deadline) dates.push(task.deadline);
      });
      if (fatherTask.fatherTask.deadline)
        dates.push(fatherTask.fatherTask.deadline);
      let maxDate = new Date(Math.max.apply(null, dates));
      let minDate = new Date(Math.min.apply(null, dates));
    //   maxDate = maxDate.toISOString();
    //   minDate = maxDate.toISOString();
      console.log("mmm", minDate, maxDate, dates)
      return {
        chart: {
          caption: fatherTask.fatherTask.title,
          dateformat: "dd/mm/yyyy",
          outputdateformat: "ddds mns yy",
          ganttwidthpercent: "60",
          ganttpaneduration: "40",
          ganttpanedurationunit: "d",
          useverticalscrolling: "0",
          plottooltext:
            "<b>$label</b><br>Start: <b>$start</b><br>End: <b>$end</b>",
          theme: "fusion",
        },
        // connectors: [
        //   {
        //     connector: [
        //       {
        //         fromtaskid: "1-1",
        //         totaskid: "2-1",
        //         color: "#F2726F",
        //         thickness: "2",
        //       },
        //       {
        //         fromtaskid: "2-1",
        //         totaskid: "3-1",
        //         color: "#F2726F",
        //         thickness: "2",
        //       },
        //       {
        //         fromtaskid: "3-1",
        //         totaskid: "4-1",
        //         color: "#F2726F",
        //         thickness: "2",
        //       },
        //       {
        //         fromtaskid: "4-1",
        //         totaskid: "5-1",
        //         color: "#F2726F",
        //         thickness: "2",
        //       },
        //       {
        //         fromtaskid: "5-1",
        //         totaskid: "6-1",
        //         color: "#F2726F",
        //         thickness: "2",
        //       },
        //       {
        //         fromtaskid: "6-1",
        //         totaskid: "7-1",
        //         color: "#F2726F",
        //         thickness: "2",
        //       },
        //       {
        //         fromtaskid: "7-1",
        //         totaskid: "8-1",
        //         color: "#F2726F",
        //         thickness: "2",
        //       },
        //       {
        //         fromtaskid: "8-1",
        //         totaskid: "9-1",
        //         color: "#F2726F",
        //         thickness: "2",
        //       },
        //       {
        //         fromtaskid: "9-1",
        //         totaskid: "10-1",
        //         color: "#F2726F",
        //         thickness: "2",
        //       },
        //     ],
        //   },
        // ],
        trendlines: [
          {
            line: [
              {
                start: deadline,
                displayvalue: "דדליין",
                color: "5D5D5D",
                thickness: "3",
                dashed: "1",
              },
            ],
          },
        ],
        // milestones: {
        //   milestone: [
        //     {
        //       date: "30/4/2018",
        //       taskid: "10-1",
        //       color: "#f8bd19",
        //       shape: "star",
        //       tooltext: "Store Opening",
        //     },
        //   ],
        // },

        tasks: {
          task: tasks,
        },
        processes: {
          headertext: "Task",
          isanimated: "1",
          headervalign: "bottom",
          headeralign: "left",
          align: "left",
          isbold: "1",
          bgalpha: "25",
          process: process,
          //     {
          //       label: "Clear site",
          //       id: "1",
          //     },
          //     {
          //       label: "Drainage & Foundation",
          //       id: "2",
          //     },
          //     {
          //       label: "Ground Floor",
          //       id: "3",
          //     },
          //     {
          //       label: "First Floor",
          //       id: "4",
          //     },
          //     {
          //       label: "Roofing",
          //       id: "5",
          //     },
          //     {
          //       label: "Connect Electricity",
          //       id: "6",
          //     },
          //     {
          //       label: "Air Conditioning",
          //       id: "7",
          //     },
          //     {
          //       label: "Interiors",
          //       id: "8",
          //     },
          //     {
          //       label: "Racking",
          //       id: "9",
          //     },
          //     {
          //       label: "Stock Shelving",
          //       id: "10",
          //     },
          //   ],
        },
        categories: [
          {
            align: "middle",
            category: [
              {
                start: "1/6/2021",
                end: "28/6/2021",
                label: "ציר זמן",
              },
            ],
          },
          {
            align: "center",
            category: [
              {
                start: "1/6/2021",
                end: "5/6/2021",
                label: "Week 1",
              },
              {
                start: "6/6/2021",
                end: "12/6/2021",
                label: "Week 2",
              },
              {
                start: "13/6/2021",
                end: "19/6/2021",
                label: "Week 3",
              },
              {
                start: "20/6/2021",
                end: "26/6/2021",
                label: "Week 4",
              },
              // {
              //   start: "29/3/2018",
              //   end: "5/4/2018",
              //   label: "Week 5",
              // },
              // {
              //   start: "6/4/2018",
              //   end: "12/4/2018",
              //   label: "Week 6",
              // },
              // {
              //   start: "13/4/2018",
              //   end: "19/4/2018",
              //   label: "Week 7",
              // },
              // {
              //   start: "19/4/2018",
              //   end: "25/4/2018",
              //   label: "Week 8",
              // },
              // {
              //   start: "25/4/2018",
              //   end: "1/5/2018",
              //   label: "Week 9",
              // },
            ],
          },
        ],
      };
    },
  },
  created() {
    //   dataSource.tasks= this.filterTasks
    //   console.log(dataSource)
  },
  data() {
    return {
      selectedFatherTaskId: 225,
      type: "gantt",
      width: "100%",
      height: "40%",
      dataFormat: "json",
    };
  },

  methods: {
    onDataPlotRollover: function (e) {
      this.$refs.fc.chartObj.slicePlotItem(0);
    },
  },
};
</script>

<style>
</style>