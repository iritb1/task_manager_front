<template>
  <div>
    <v-snackbar
      v-for="(snackbar, index) in snackbars.filter(s => s.showing)"
      :key="snackbar.key"
      :value="snackbar.showing"
      @input="removeSnackbar(snackbar)"
      :timeout="snackbar.timeout"
      :color="snackbar.color"
      :style="`padding-bottom: ${index * 80 + 8}px`"
    >
      <span>
        <span>{{ snackbar.text.split("@")[0] }}</span>
        <b>{{ snackbar.param }}</b>
        <span>{{ snackbar.text.split("@")[1] }}</span>
          <b v-if="snackbar.param2">{{ snackbar.param2 }}</b>
        <span v-if="snackbar.text.split('@')[2]">{{ snackbar.text.split("@")[2] }}</span>
      </span>
      <template v-slot:action="{ attrs }">
        <v-btn text v-bind="attrs" @click="removeSnackbar(snackbar)">
          סגור
        </v-btn>
      </template>
    </v-snackbar>
  </div>
</template>

<script>
import { mapState, mapActions } from "vuex";
export default {
  computed: {
    ...mapState({
      snackbars: state => state.snackbar.snackbars
    })
  },
  methods: {
    ...mapActions("snackbar", ["removeSnackbar"]),
    stringFormat: function() {
      var s = arguments[0];
      for (var i = 0; i < arguments.length - 1; i++) {
        var reg = new RegExp("\\{" + i + "\\}", "gm");
        s = s.replace(reg, arguments[i + 1]);
      }
      return s;
    }
  }
};
</script>