<template>
  <div class="mapContainer">
    <div id="map" class="map-box"></div>
    <div style="margin-right: 10px; width: 200px">
      <v-select
        v-model="domainsFilter"
        :items="domains"
        label="תחומים"
        item-text="name"
        item-value="id"
        multiple
        chips
      ></v-select>
    </div>
    <div style="margin-right: 10px; width: 200px">
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
    </div>
  </div>
</template>

<script>
import mapboxgl from "mapbox-gl";
import { api } from "../apiConfig";
import { mapGetters, mapActions, mapMutations } from "vuex";
export default {
  name: "TasksMap",
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
      "filterTasks",
      "getTask",
      "getFatherTaskTitle",
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
  },
  data: function () {
    return {
      map: null,
      tasksSourceName: "tasks-points",
      mapIcons: [],
      mapConfig: {
        mapCenter: [35.20722507951996, 32.26789836634515],
        mapStartZoom: 8,
        style: "/mapbox/map-style.json",
        images: [
          //   { id: "marker", imageUrl: "/images/marker.png" },
          { id: "marker-white", imageUrl: "./marker-white.png" },
          //   { id: "trayNode", imageUrl: "/images/trayNode.png" },
          //   { id: "planTrayNode", imageUrl: "/images/planTrayNode.png" },
          //   { id: "nodeSymbol-24", imageUrl: "/images/nodeSymbol-24.png" },
          //   { id: "building", imageUrl: "/images/building.png" },
        ],
      },
    };
  },
  mounted() {
    this.initMap();
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
    removeSearchStaff: function (removedEntity) {
      let updStaffSearch = this.filters.staff.filter(
        (entityId) => entityId != removedEntity.id
      );
      this.setFilters({ staff: updStaffSearch });
    },
    updateTasksMapSource() {
      let filterTasksWithLocation = this.filterTasks.filter((task) => {
        return task.building.lng && task.building.lat;
      });
      let data = filterTasksWithLocation.map((task) => {
        return {
          // feature for Mapbox DC
          type: "Feature",
          geometry: {
            type: "Point",
            coordinates: [task.building.lng, task.building.lat],
          },
          id: task.id,
          properties: {
            id: task.id,
            father_id: task.father_id,
            title: task.title,
          },
        };
      });
      this.map.getSource(this.tasksSourceName).setData({
        type: "FeatureCollection",
        features: data,
      });
    },
    initMap() {
      try {
        mapboxgl.accessToken =
          "pk.eyJ1IjoiZXhhbXBsZXMiLCJhIjoiY2p0MG01MXRqMW45cjQzb2R6b2ptc3J4MSJ9.zA2W0IkI0c6KaAhJfk9bWg";
        mapboxgl.setRTLTextPlugin(
          "/mapbox/mapbox-gl-rtl-text.js",
          null,
          true // Lazy load the plugin
        );
      } catch {
        console.log("setRTLTextPlugin aborted");
      }

      let mapConf = this.mapConfig;
      this.mapCenter = mapConf.mapCenter;
      this.mapStartZoom = mapConf.mapStartZoom;
      this.mapStyleUrl = mapConf.style;
      this.mapIcons = mapConf.icons;
      this.mapLayers = mapConf.layers;

      this.map = new mapboxgl.Map({
        container: "map",
        style: this.mapStyleUrl,
        center: this.mapCenter,
        zoom: this.mapStartZoom,
        attributionControl: false,
        preserveDrawingBuffer: true,
      });
      this.map.addControl(new mapboxgl.NavigationControl(), "top-left");
      this.map.addControl(new mapboxgl.FullscreenControl(), "top-left");
      this.map.on("load", this.onMapLoad);
    },
    async onMapLoad() {
      this.map.addSource(this.tasksSourceName, {
        type: "geojson",
        data: {
          type: "FeatureCollection",
          features: [],
        },
      });
      this.updateTasksMapSource();
      await Promise.all(
        this.mapConfig.images.map(
          (img) =>
            new Promise((resolve) => {
              console.log("loading image: " + img.id + " " + img.imageUrl);
              this.map.loadImage(img.imageUrl, (error, res) => {
                this.map.addImage(img.id, res);
                console.log("addedImage:" + img.id);
                resolve();
              });
            })
        )
      );
      this.map.addLayer({
        id: "tasks",
        type: "symbol",
        source: this.tasksSourceName,
        layout: {
          "icon-image": "marker-white",
          // get the title name from the source's "title" property
          "text-field": ["get", "title"],
          "text-font": ["Open Sans Semibold", "Arial Unicode MS Bold"],
          "text-offset": [0, 1.25],
          "text-anchor": "top",
          "icon-allow-overlap": true,
          "text-size": {
            stops: [
              [0, 0],
              [12, 0],
              [13, 7],
              [15, 18],
            ],
          },
          "text-allow-overlap": true,
          //'icon-ignore-placment':true,
          //'text-ignore-placment':true,
        },
      });
      this.map.on("click", "tasks", this.onLayerClickListner);
    },
    onLayerClickListner(e) {
      let layerid = e.features[0].layer.id;
      if (layerid == "tasks") {
        let props = e.features[0].properties;
        this.$root.$emit("call-father-task-dialog", {
          fatherTaskId: props.father_id,
          isTemplate: false,
          loadFromTemplate: false,
          range: null,
          editTitle: false,
          taskId: props.id,
        });
      }
    },
  },
  watch: {
    //update tasks on map when change is detected
    filterTasks: function (newValue, oldValue) {
      //console.log('watch filter tasks triggered',newValue, oldValue)
      this.updateTasksMapSource();
    },
  },
};
</script>

<style scoped>
#map {
  position: absolute;
  top: 0;
  bottom: 0;
  width: 100%;
}
</style>