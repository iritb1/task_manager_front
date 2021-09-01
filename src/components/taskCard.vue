<template>
  <div>
    <v-card
      width="100%"
      elevation="20"
      :color="value.is_template ? '#8bcb8d' : '#b3c3da'"
    >
      <v-form ref="form" v-model="valid">
        <v-container fluid>
          <v-row style="margin-bottom: -30px">
            <v-col :cols="computedTitleWidth" :sm="computedTitleWidth - 3">
              <v-text-field
                :disabled="locked"
                placeholder="הכנס כותרת"
                :rules="[validationRules.required, validationRules.counter100]"
                solo
                :value="value.title"
                @input="onFormChange('title', $event)"
              >
              </v-text-field>
            </v-col>

            <v-col cols="1" class="text-center" v-if="!value.background">
              <h3 style="margin-top: -7px">
                <v-checkbox
                  :disabled="locked"
                  v-model="isFault"
                  label="תקלה"
                  color="error"
                  :readonly="
                    typeof value.fault_data === 'object' &&
                    value.fault_data !== null &&
                    'url' in value.fault_data
                  "
                ></v-checkbox>
              </h3>

              <v-menu top :offset-y="true" v-if="value.fault_data">
                <template v-slot:activator="{ on, attrs }">
                  <v-btn
                    v-bind="attrs"
                    v-on="on"
                    style="color: white; position: absolute; left: 20px;margin-top: 5px;"
                    color="orange lighten-2"
                  >
                    <div>הצג פרטי תקלה</div>
                  </v-btn>
                </template>

                <v-simple-table>
                  <template v-slot:default>
                    <tbody>
                      <tr>
                        <td
                          v-if="'url' in value.fault_data"
                          colspan="2"
                          style="text-align: center"
                        >
                          <a target="_blank" :href="value.fault_data.url">
                            פתח תקלה ב NETCOOL
                          </a>
                        </td>
                        <td v-else>תקלה לא מקושרת ל NETCOOL</td>
                      </tr>
                      <tr
                        v-for="(value, key) in loadash.omit(
                          value.fault_data,
                          'url'
                        )"
                        :key="key"
                      >
                        <td>{{ value }}</td>
                        <td>{{ key }}</td>
                      </tr>
                    </tbody>
                  </template>
                </v-simple-table>
              </v-menu>
            </v-col>
            <v-col
              cols="1"
              class="text-center"
              v-if="value.id < 0 || value.background"
            >
              <h3 style="margin-top: -7px">
                <v-checkbox
                  :readonly="value.id > 0"
                  v-model="value.background"
                  label="אירוע רקע"
                  color="blue"
                  :disabled="value.fault_data != null"
                ></v-checkbox>
              </h3>
            </v-col>
            <v-col cols="1">
              <v-text-field
                solo
                hint="סדר ביצוע"
                persistent-hint
                type="number"
                v-model.number="value.priority"
                :rules="[validationRules.between0to100]"
              >
              </v-text-field>
            </v-col>
            <v-col class="text-center" cols="2" sm="4">
              <h3 style="margin-top: -22px">דחיפות</h3>
              <v-btn-toggle
                mandatory
                :value="value.urgency_id"
                @change="onFormChange('urgency_id', $event)"
              >
                <v-btn
                  :disabled="locked"
                  :class="{ 'disable-events': locked }"
                  :style="{
                    color: urgency.id == urgencies[2].id ? 'red' : '',
                  }"
                  v-for="urgency in urgencies"
                  :key="urgency.id"
                  :value="urgency.id"
                  >{{ urgency.name }}</v-btn
                >
              </v-btn-toggle>
            </v-col>
            <v-col class="text-center" cols="2" sm="3">
              <h3 style="margin-top: -22px">סטטוס</h3>
              <v-btn-toggle
                mandatory
                :value="value.status_id"
                @change="onFormChange('status_id', $event)"
              >
                <v-btn
                  :class="{ 'disable-events': locked }"
                  :style="{
                    color:
                      status.id == statuses[0].id
                        ? '#4083ff'
                        : status.id == statuses[1].id
                        ? 'orange'
                        : '#4CAF50',
                  }"
                  :disabled="value.is_template || locked || isDragedPopUp"
                  v-for="status in statuses"
                  :key="status.id"
                  :value="status.id"
                  >{{ status.name }}</v-btn
                >
              </v-btn-toggle>
            </v-col>
          </v-row>
          <v-row v-if="!value.background">
            <v-col class="text-center" cols="3">
              <h3>תחום אחראי</h3>
              <v-select
                :disabled="locked"
                solo
                :value="value.domain_id"
                @change="onFormChange('domain_id', $event)"
                :rules="[validationRules.required]"
                class="rtl"
                :items="domains"
                item-text="name"
                item-value="id"
              ></v-select>
            </v-col>
            <v-col class="text-center" cols="3">
              <h3>סוג משימה</h3>
              <v-select
                :disabled="locked"
                solo
                :rules="[validationRules.required]"
                :value="value.type_id"
                @change="onFormChange('type_id', $event)"
                :items="taskTypes"
                item-text="name"
                item-value="id"
              ></v-select>
            </v-col>
            <v-col class="text-center" cols="2">
              <h3>דדליין</h3>
              <v-menu
                v-model="deadlineMenu"
                transition="scale-transition"
                :close-on-content-click="false"
              >
                <template v-slot:activator="{ on, attrs }">
                  <v-text-field
                    :rules="
                      fatherTaskDeadline
                        ? [
                            (value) =>
                              !!value ||
                              'שדה חובה מכיוון שהוגדר דדליין למשימת אב',
                          ]
                        : []
                    "
                    :disabled="value.is_template || locked"
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
                      :min="value.end ? value.end.toISOString() : tomorrow"
                      :max="fatherTaskDeadline"
                      scrollable
                      locale="he-IL"
                      :value="value.deadline"
                      @change="onFormChange('deadline', $event)"
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
                          onFormChange('deadline', null);
                        "
                        >נקה</v-btn
                      >
                    </slot>
                  </v-card-actions>
                </v-card>
              </v-menu>
            </v-col>
            <v-col class="text-center" cols="4" sm="4">
              <div
                style="
                  grid-template-columns: 1fr 1fr 1fr 1fr 1fr 1fr;
                  display: grid;
                "
              >
                <label
                  style="
                    border-radius: 20px;
                    -webkit-appearance: none;
                    grid-column-start: 1;
                    grid-column-end: 4;
                  "
                  type="button"
                >
                  <input
                    :disabled="locked"
                    style="display: none"
                    type="file"
                    name="files[]"
                    ref="taskFileAdd"
                    v-on:change="handleFilesChange()"
                  />
                  <h3>
                    צרף קובץ
                    <v-btn
                      :disabled="locked"
                      class="ms-2 me-10 elevation-0"
                      fab
                      x-small
                      dark
                      @click="addNewFile"
                    >
                      <v-icon> mdi-clipboard-file </v-icon>
                    </v-btn>
                  </h3>
                </label>
                <v-checkbox
                  style="
                    margin-top: 0px;
                  "
                  v-model="value.file_required"
                  :disabled="locked"
                  label="חובה"
                  :readonly="value.id > 0 && !value.editable"
                ></v-checkbox>
                <v-text-field
                  class="visable-errors"
                  style="
                    visibility: hidden;
                    height: 0px;
                    grid-column-start: 2;
                    grid-column-end: 5;
                  "
                  :value="value.files_url"
                  :rules="[
                    ...(value.file_required && value.status_id == 3
                      ? validationRules.requiredFile
                      : []),
                  ]"
                  hide-details="auto"
                ></v-text-field>
                <v-progress-linear
                  v-if="isUplading"
                  v-model="uploadProgress"
                  stream
                  buffer-value="0"
                  dir="ltr"
                  class="ma-3"
                  height="3"
                  style="grid-column-start: 1; grid-column-end: 5"
                ></v-progress-linear>
                <div
                  class="fileList"
                  v-if="value.files_url != []"
                  style="grid-column-start: 1; grid-column-end: 6"
                >
                  <div
                    v-for="(file, key) in value.files_url"
                    :key="value.files_url.indexOf(file)"
                    style="display: flex; padding: 0 6px 0 6px"
                  >
                    <v-icon
                      v-if="file.type.indexOf('.document') > -1"
                      style="color: blue; font-size: 17px"
                      >mdi-file-word-outline</v-icon
                    >
                    <v-icon
                      v-else-if="
                        file.type.indexOf('.sheet') > -1 ||
                        file.type.indexOf('excel') > -1
                      "
                      style="color: green; font-size: 17px"
                      >mdi-file-excel-outline</v-icon
                    >
                    <v-icon
                      v-else-if="file.type.indexOf('.presentation') > -1"
                      style="color: darkorange; font-size: 17px"
                      >mdi-file-powerpoint-outline</v-icon
                    >
                    <v-icon
                      v-else-if="file.type.indexOf('pdf') > -1"
                      style="color: red; font-size: 17px"
                      >mdi-file-pdf-outline</v-icon
                    >
                    <v-icon
                      v-else-if="file.type.indexOf('image') > -1"
                      style="color: Chocolate; font-size: 17px"
                      >mdi-file-image-outline</v-icon
                    >
                    <v-icon
                      v-else-if="file.type.indexOf('video') > -1"
                      style="color: Teal; font-size: 17px"
                      >mdi-file-video-outline</v-icon
                    >
                    <v-icon
                      v-else-if="file.type.indexOf('audio') > -1"
                      style="color: LightSlateGray; font-size: 17px"
                      >mdi-file-music-outline</v-icon
                    >
                    <v-icon
                      v-else-if="
                        file.name.indexOf('.zip') > -1 ||
                        file.name.indexOf('.rar') > -1
                      "
                      style="color: Indigo; font-size: 17px"
                      >mdi-folder-zip-outline</v-icon
                    >
                    <v-icon v-else style="font-size: 17px"
                      >mdi-file-outline</v-icon
                    >
                    <u class="fileTextOpen" @click="openURL(file.url)">{{
                      file.name
                    }}</u
                    ><v-icon class="fileRemoveBtn" v-on:click="removeFile(key)"
                      >close</v-icon
                    >
                  </div>
                </div>
              </div>
            </v-col>
          </v-row>
          <v-row style="margin-top: -20px">
            <v-col v-if="!value.background" class="text-center" cols="5">
              <h3>משימות</h3>

              <v-simple-table dense height="150">
                <template v-slot:default>
                  <thead>
                    <tr style="height: 50px">
                      <td><v-text-field v-model="NewsubTaskText" dense /></td>
                      <td>
                        <v-btn
                          :disabled="locked"
                          x-small
                          color="success"
                          @click="addSubTask"
                        >
                          <v-icon>mdi-plus</v-icon>
                        </v-btn>
                      </td>
                    </tr>
                  </thead>
                  <tbody>
                    <tr
                      v-for="(subTask, index) in value.check_list"
                      :key="index"
                    >
                      <td style="overflow-wrap: anywhere">
                        {{ subTask[0] }}
                      </td>
                      <td style="width: 100px">
                        <div style="margin-top: 10px">
                          <v-checkbox
                            :disabled="value.is_template || locked"
                            style="
                              direction: ltr;
                              display: inline-block;
                              padding: 0;
                              margin: auto 0 auto 0;
                            "
                            v-model="subTask[1]"
                            color="success"
                          ></v-checkbox>
                          <v-btn
                            :disabled="locked"
                            @click="value.check_list.splice(index, 1)"
                            style="
                              height: 25px;
                              width: 25px;
                              margin: 0 8px 11px 0px;
                            "
                            color="error"
                            fab
                          >
                            <v-icon
                              style="margin-bottom: 1.5px; font-size: 17px"
                              >mdi-delete</v-icon
                            >
                          </v-btn>
                        </div>
                      </td>
                    </tr>
                  </tbody>
                </template>
              </v-simple-table>

              <!-- <div
                v-for="(task, index) in value.check_list"
                :key="index"
                style="display: flex"
              >
                <v-checkbox
                  style="direction: ltr"
                  v-model="isFault"
                  color="success"
                ></v-checkbox>
              </div>

              <v-checkbox
                style="direction: ltr"
                v-model="isFault"
                color="success"
              ></v-checkbox> -->
            </v-col>
            <v-col class="text-center" cols="4" sm="4">
              <h3>צוות משובץ</h3>
              <v-autocomplete
                :disabled="!value.editable || locked"
                :value="value.crew"
                @change="onFormChange('crew', $event)"
                :items="allStaffByDomains"
                item-text="name"
                item-value="id"
                :filter="entitySearch"
                hide-no-data
                small-chips
                multiple
                solo
              >
                <template v-slot:selection="data">
                  <v-chip
                    small
                    v-bind="data.attrs"
                    :input-value="data.selected"
                    :close="!locked"
                    @click:close="removeSearchStaff(data.item)"
                  >
                    {{ data.item.name }}
                  </v-chip>
                </template>
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
              <h3>תיאור</h3>
              <v-textarea
                :disabled="locked"
                row
                rows="1"
                solo
                :rules="[validationRules.counter1000]"
                :value="value.description"
                @input="onFormChange('description', $event)"
              ></v-textarea>
              <!-- <v-textarea
                :disabled="locked"
                row
                rows="1"
                solo
                :rules="[validationRules.counter1000]"
                :value="value.description"
                @input="onFormChange('description', $event)"
              ></v-textarea> -->
            </v-col>
            <v-col class="text-center" style="padding-left: 50px" cols="3">
              <span class="text-center datetime-picker">
                <h3>תאריך התחלה</h3>
                <v-datetime-picker
                  :disabled="!value.editable || value.is_template || locked"
                  date-format="dd/MM/yyyy"
                  :date-picker-props="{
                    locale: 'he-IL',
                    scrollable: true,
                    max: value.deadline ? value.deadline : '',
                  }"
                  :timePickerProps="{ format: '24hr' }"
                  :text-field-props="{
                    prependIcon: 'event',
                    rules: [
                      validateStart,
                      ...(value.background ? [validationRules.required] : []),
                    ],
                  }"
                  v-model="computedStart"
                ></v-datetime-picker>
              </span>
              <span class="datetime-picker">
                <h3
                  :style="value.fault_data ? 'margin-top: 0' : 'margin-top: 0;'"
                >
                  תאריך סיום
                </h3>
                <v-datetime-picker
                  :disabled="!value.editable || value.is_template || locked"
                  date-format="dd/MM/yyyy"
                  :date-picker-props="{
                    locale: 'he-IL',
                    scrollable: true,
                    max: value.deadline ? value.deadline : '',
                  }"
                  :timePickerProps="{ format: '24hr' }"
                  :text-field-props="{
                    prependIcon: 'event',
                    rules: [
                      validateEnd,
                      ...(value.background ? [validationRules.required] : []),
                    ],
                  }"
                  @change="onFormChange"
                  v-model="computedEnd"
                ></v-datetime-picker>
              </span>
            </v-col>
          </v-row>

          <v-row v-if="!value.background" style="margin-top: -20px">
            <!-- <v-col class="text-center" cols="4" sm="4">
              <v-icon style="font-size: 50px; margin-top: 48px" x-large>
                mdi-clipboard-file
              </v-icon>
            </v-col> -->
            <v-col class="text-center" cols="3">
              <h3>שייך תכנון</h3>
              <v-autocomplete
                :rules="[validationRules.stringifyMax3000]"
                :disabled="locked"
                :value="value.plannings"
                @change="onFormChange('plannings', $event)"
                :items="$store.state.metadata.plannings"
                item-text="name"
                item-value="id"
                hide-no-data
                small-chips
                multiple
                label="חיפוש"
              >
                <template v-slot:selection> </template>
                <template v-slot:item="data">
                  <v-list-item-content>
                    <v-list-item-title
                      v-html="data.item.name"
                    ></v-list-item-title>
                    <v-list-item-subtitle
                      v-html="data.item.team"
                    ></v-list-item-subtitle>
                  </v-list-item-content>
                </template>
              </v-autocomplete>
              <div style="width: 100%" class="fileList">
                <div
                  v-for="planningId in value.plannings"
                  :key="planningId"
                  style="display: flex; padding: 0 6px 0 6px"
                >
                  <v-icon style="font-size: 17px">mdi-file-outline</v-icon>
                  <a
                    class="planningOpen"
                    target="_blank"
                    :href="
                      $store.state.config.FNT_PLANNING_URL.formatUnicorn({
                        id: $store.state.metadata.plannings.find(
                          (planning) => planning.id == planningId
                        ).id,
                        sid: $store.state.userData.sid,
                      })
                    "
                  >
                    {{
                      $store.state.metadata.plannings.find(
                        (planning) => planning.id == planningId
                      ).name
                    }} </a
                  ><v-icon
                    v-if="!locked"
                    class="fileRemoveBtn"
                    v-on:click="removePlanning(planningId)"
                    >close</v-icon
                  >
                </div>
              </div>
            </v-col>
            <v-col class="text-center" cols="3">
              <h3>שייך ציוד</h3>
              <v-autocomplete
                :disabled="locked"
                :rules="[
                  validationRules.stringifyMax3000,
                  ...($store.state.metadata.taskTypes.find(
                    (type) => type.id == value.type_id
                  ).equipment_required && value.status_id == 3
                    ? validationRules.requiredEquipment
                    : []),
                ]"
                :value="value.equipment"
                @change="onFormChange('equipment', $event)"
                :items="equipmenEntries"
                :loading="isEquipmenLoading"
                :search-input.sync="equipmentSearch"
                item-text="visible_id"
                item-value="internal_id"
                hide-no-data
                multiple
                label="חיפוש"
                placeholder="הקלד לחיפוש ציוד"
                prepend-icon="mdi-database-search"
                return-object
              >
                <template v-slot:selection> </template>
                <template v-slot:item="data">
                  <v-list-item-avatar>
                    <v-img
                      :src="
                        require(`../assets/FNT_icons/${data.item.icon_name}-48.png`)
                      "
                    />
                  </v-list-item-avatar>
                  <v-list-item-content>
                    <v-list-item-title
                      v-html="data.item.visible_id"
                    ></v-list-item-title>
                    <v-list-item-subtitle
                      v-html="data.item.campus"
                    ></v-list-item-subtitle>
                  </v-list-item-content>
                </template>
              </v-autocomplete>
              <div style="width: 100%" class="fileList">
                <div
                  v-for="equipment in value.equipment"
                  :key="equipment.internal_id"
                  style="display: flex; padding: 0 6px 0 6px"
                >
                  <v-img
                    style="width: 1.5em"
                    contain
                    :src="
                      require(`../assets/FNT_icons/${equipment.icon_name}-48.png`)
                    "
                    transition="scale-transition"
                    width="75"
                  />
                  <a
                    class="planningOpen"
                    target="_blank"
                    :href="
                      $store.state.config.FNT_EQUIPMENT_URL.formatUnicorn({
                        id: equipment.internal_id,
                        sid: $store.state.userData.sid,
                      })
                    "
                  >
                    {{ equipment.visible_id }}
                  </a>

                  <v-icon
                    v-if="!locked"
                    class="fileRemoveBtn"
                    v-on:click="removeEquipment(equipment)"
                    >close</v-icon
                  >
                </div>
              </div>
            </v-col>
            <v-col class="text-center" cols="3">
              <h3>שייך אתר</h3>
              <v-autocomplete
                :disabled="locked"
                :rules="[
                  validationRules.stringifyMax3000,
                  ...($store.state.metadata.taskTypes.find(
                    (type) => type.id == value.type_id
                  ).equipment_required && value.status_id == 3
                    ? validationRules.requiredEquipment
                    : []),
                ]"
                :value="value.building"
                @change="onFormChange('building', $event)"
                :items="buildingsEntries"
                :loading="isBuildingLoading"
                :search-input.sync="buildingSearch"
                item-text="name"
                hide-no-data
                label="חיפוש"
                placeholder="הקלד לחיפוש אתרים"
                prepend-icon="mdi-database-search"
                return-object
              >
                <!-- <template v-slot:selection="data"> {{data}}</template> -->
                <!-- stoped here -->
                <template v-slot:item="data">
                  <v-list-item-avatar>
                    <v-img
                      :src="require(`../assets/FNT_icons/houseSymbol-48.png`)"
                    />
                  </v-list-item-avatar>
                  <v-list-item-content>
                    <v-list-item-title
                      v-html="data.item.name"
                    ></v-list-item-title>
                    <v-list-item-subtitle
                      v-html="data.item.internal_id"
                    ></v-list-item-subtitle>
                  </v-list-item-content>
                </template>
              </v-autocomplete>
            </v-col>
            <v-col cols="1" />
            <v-col cols="1">
              <div
                v-if="value.id > 0"
                style="color: rgba(0, 0, 0, 0.6); margin-top:40px;"
              >
                נוצר על יד:{{ " " + value.creator }}
              </div>
            </v-col>
            <v-col cols="1">
              <div
                v-if="value.id > 0"
                style="color: rgba(0, 0, 0, 0.6);margin-top:40px;"
              >
                בתאריך:{{ " " + value.creation_time }}
              </div>
            </v-col>
            <!-- <v-col class="text-center" cols="4" sm="4">
              <div
                v-if="value.id > 0"
                style="color: rgba(0, 0, 0, 0.6); margin-top: 10%"
              >
                נוצר על יד:{{ " " + value.creator }}
              </div>

              <div
                v-if="value.id > 0"
                style="color: rgba(0, 0, 0, 0.6); margin-top: 5%"
              >
                בתאריך:{{ " " + value.creation_time }}
              </div>
            </v-col> -->
          </v-row>
        </v-container>
        <div style="position: absolute; bottom: 38%; left: 20px">
          <v-tooltip v-if="!isDragedPopUp" top>
            <template v-slot:activator="{ on, attrs }">
              <v-btn
                :disabled="locked"
                v-bind="attrs"
                v-on="on"
                color="error"
                fab
                class="mt-2 action-button"
                @click="$emit('on-task-delete', value)"
              >
                <v-icon class="action-button-icon">mdi-delete</v-icon>
              </v-btn>
            </template>
            מחק
          </v-tooltip>
          <br />
          <v-tooltip top>
            <template v-slot:activator="{ on, attrs }">
              <v-btn
                v-bind="attrs"
                v-on="on"
                :disabled="
                  !valid || !computedIsEdited || !value.father_id || locked
                "
                color="success"
                fab
                class="mt-2 action-button"
                :loading="isUplading"
                @click="onSave"
              >
                <v-icon class="action-button-icon">save</v-icon>
              </v-btn>
            </template>
            שמור משימה
          </v-tooltip>
          <br />
          <v-tooltip v-if="!isDragedPopUp" top>
            <template v-slot:activator="{ on, attrs }">
              <v-btn
                v-bind="attrs"
                v-on="on"
                color="orange"
                fab
                class="mt-2 action-button"
                @click="showReportArea = true"
                v-if="!value.background && value.father_id"
              >
                <v-icon class="action-button-icon" style="color: white"
                  >mdi-file</v-icon
                >
              </v-btn>
            </template>
            הפק דוח למשימה
          </v-tooltip>
          <br v-if="!value.background && value.father_id" />
          <v-tooltip v-if="!isDragedPopUp" top>
            <template v-slot:activator="{ on, attrs }">
              <v-btn
                :disabled="locked"
                v-bind="attrs"
                v-on="on"
                color="blue"
                fab
                class="mt-2 action-button"
                @click="$emit('on-task-copy', value.id)"
              >
                <v-icon class="action-button-icon" style="color: white"
                  >mdi-content-copy</v-icon
                >
              </v-btn>
            </template>
            שכפל תת משימה
          </v-tooltip>
        </div>
      </v-form>
    </v-card>
    <v-dialog v-model="showReportArea" width="50%">
      <v-card>
        <reportsArea
          :task="{
            id: value.id,
            isFault:
              typeof value.fault_data === 'object' && value.fault_data !== null,
          }"
        />
        <v-btn color="success" @click="showReportArea = false"> סגור </v-btn>
      </v-card>
    </v-dialog>
  </div>
</template>

<script>
import reportsArea from "./reportsArea";
import { mapGetters } from "vuex";
import { api } from "../apiConfig";
import { addMinutes } from "date-fns";
import moment from "moment";
import _ from "lodash";
import ReportsArea from "./reportsArea.vue";
// import axios from "axios";
export default {
  components: {
    reportsArea,
  },
  props: {
    isDragedPopUp: {
      type: Boolean,
      default: false,
    },
    value: {
      type: Object,
    },
    fatherTaskDeadline: {
      type: String,
    },
    locked: {
      type: Boolean,
    },
  },
  computed: {
    ...mapGetters("metadata", [
      "domains",
      "taskTypes",
      "urgencies",
      "statuses",
      "allStaffByDomains",
    ]),
    computedTitleWidth() {
      let width = 6;
      // if (this.value.fault_data || this.value.id < 0) {
      //   width--;
      // }
      if (this.value.background || this.value.id < 0) {
        width--;
      }
      return width;
    },

    isFault: {
      get() {
        return this.value.fault_data != null;
      },
      set(value) {
        this.onFormChange("fault_data", value ? {} : null);
      },
    },
    computedStart: {
      // getter
      get: function () {
        return this.decreaseTimeZoneDiff(this.value.start);
      },
      // setter
      set: function (newValue) {
        this.onFormChange("start", this.increaseTimeZoneDiff(newValue));
      },
    },
    computedEnd: {
      // getter
      get: function () {
        return this.decreaseTimeZoneDiff(this.value.end);
      },
      // setter
      set: function (newValue) {
        this.onFormChange("end", this.increaseTimeZoneDiff(newValue));
      },
    },
    // return deadline formated (dd-mm-yyyy)
    computedDeadLineFormatted() {
      return this.formatDate(this.value.deadline);
    },
    computedSavedTask() {
      if (this.value.is_template) {
        return this.$store.getters["tasksTemplates/getTemplateTask"](
          this.value.father_id,
          this.value.id
        );
      } else {
        return this.$store.getters.getTask(this.value.id);
      }
    },
    savedData() {
      if (this.value.is_template) {
        return this.$store.getters["tasksTemplates/getTemplateTask"](
          this.value.father_id,
          this.value.id
        );
      } else {
        return this.$store.getters.getTask(this.value.id);
      }
    },
    computedIsEdited() {
      if (this.value.is_template) {
        return (
          JSON.stringify(this.value) !==
          JSON.stringify(
            this.$store.getters["tasksTemplates/getTemplateTask"](
              this.value.father_id,
              this.value.id
            )
          )
        );
      } else {
        return (
          JSON.stringify(this.value) !==
          JSON.stringify(this.$store.getters.getTask(this.value.id))
        );
      }
    },
    // isDatesValid() {
    //   if (this.value.start !== null && this.value.end !== null) {
    //     if (this.value.start >= this.value.end) {
    //       return false;
    //     }
    //   }
    //   if (this.value.start !== null && this.value.end === null) {
    //     return false;
    //   }
    //   if (this.value.start === null && this.value.end !== null) {
    //     return false;
    //   }

    //   return true;
    // },
    // datesErrors() {
    //   let errors = { start: [], end: [] };
    //   if (this.value.start !== null && this.value.end !== null) {
    //     if (this.value.start >= this.value.end) {
    //       errors.end.push("סיום חייב להיות אחרי התחלה");
    //     }
    //   }
    //   if (this.value.start !== null && this.value.end === null) {
    //     errors.end.push("לא ניתן למלא התחלה ללא סיום");
    //   }
    //   if (this.value.start === null && this.value.end !== null) {
    //     errors.start.push("לא ניתן למלא סיום ללא התחלה");
    //   }
    //   return errors;
    // },
    computedDomainID() {
      return this.value.domain_id;
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
      showReportArea: false,
      //if from is valid (if save button is eanbled)
      valid: true,
      //flag (if deadline menut is open or close)
      deadlineMenu: false,
      isUplading: false,
      uploadProgress: 0,
      files: [],
      loadash: _,
      equipmentdescriptionLimit: 50,
      equipmenEntries: [],
      buildingsEntries: this.value.building.name ? [this.value.building] : [],
      isEquipmenLoading: false,
      isBuildingLoading: false,
      equipmentSearch: null,
      buildingSearch: null,
      NewsubTaskText: "",
      validationRules: {
        required: (value) => !!value || "שדה חובה",
        requiredFile: (value) =>
          value.length > 0 || "חובה לצרף קובץ למשימה לפני סיומה",
        requiredEquipment: (value) =>
          value.length > 0 || "חובה לשייך ציוד למשימה לפני סיומה",
        between0to100: (value) => (value >= 0 && value <= 100) || "0-100",
        counter100: (value) => value.length <= 100 || "עד 100 תווים",
        counter1000: (value) => value.length <= 1000 || "עד 1000 תווים",
        stringifyMax3000: (value) =>
          JSON.stringify(value).length < 3000 || "ערך גדול מהמותר",
      },
    };
  },
  methods: {
    /**
     * add new sub task
     */
    addSubTask() {
      if (this.NewsubTaskText != "") {
        this.value.check_list.push([this.NewsubTaskText, false]);
        this.NewsubTaskText = "";
      } else if (
        (JSON.stringify(this.value.check_list) + this.NewsubTaskText).length >=
        2988
      ) {
        this.$store.dispatch("snackbar/setSnackbar", {
          color: "orange",
          text: `שדה גדול מנערך המותר, קצר את המשימה הכדי להוסיפה`,
        });
      } else {
        this.$store.dispatch("snackbar/setSnackbar", {
          color: "orange",
          text: `הכנס טקסט, תת משימה ריקה`,
        });
      }
    },
    /**
     * search entity method
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
    // CalcEntityfullName(entity) {
    //   if ("first_name" in entity) {
    //     return entity.first_name + " " + entity.last_name;
    //   } else return entity;
    // },
    removeEquipment: function (removeEquipment) {
      let updEquipment = this.value.equipment.filter(
        (equipment) => equipment.internal_id != removeEquipment.internal_id
      );
      this.onFormChange("equipment", updEquipment);
    },
    removePlanning: function (id) {
      let updPlanning = this.value.plannings.filter(
        (planningId) => planningId != id
      );
      this.onFormChange("plannings", updPlanning);
    },
    removeSearchStaff: function (removedEntity) {
      let updCrew = this.value.crew.filter(
        (entityId) => entityId != removedEntity.id
      );
      this.onFormChange("crew", updCrew);
    },
    validateStart(start) {
      if (start === "" && this.value.end !== null) {
        return "לא ניתן למלא סיום ללא התחלה";
      }

      if (start !== "" && this.value.end !== null) {
        start = moment(start, "DD/MM/YYYY hh:mm").toDate();
        const end = this.decreaseTimeZoneDiff(this.value.end);
        if (start > end) {
          return "התחלה אחרי סיום";
        }
        if (start.getTime() == end.getTime()) {
          return "התחלה וסיום זהים";
        }
      }
      return true;
    },
    validateEnd(end) {
      if (this.value.start !== null && end === "") {
        return "לא ניתן למלא התחלה ללא סיום";
      }
      return true;
    },
    decreaseTimeZoneDiff(date) {
      if (date == null) {
        return null;
      }
      return addMinutes(date, date.getTimezoneOffset());
    },
    increaseTimeZoneDiff(date) {
      if (date == null) {
        return null;
      }
      return addMinutes(date, -date.getTimezoneOffset());
    },
    addNewFile() {
      this.$refs.taskFileAdd.click();
    },
    handleFilesChange() {
      var uploadedFiles = this.$refs.taskFileAdd.files;
      if (uploadedFiles.length > 0) {
        for (var i = 0; i < uploadedFiles.length; i++) {
          this.files.push(uploadedFiles[i]);

          var formData = new FormData();
          formData.append("files[]", this.$refs.taskFileAdd.files[0]);
          api
            .post("task/file-upload", formData, {
              headers: {
                "Content-Type": "multipart/form-data",
              },
              onUploadProgress: (uploadStatus) => {
                this.uploadProgress = Math.round(
                  (uploadStatus.loaded / uploadStatus.total) * 100
                );
                this.isUplading = true;
              },
            })
            .then((response) => {
              this.isUplading = false;
              this.value.files_url.push({
                name: this.files[0].name,
                type: this.files[0].type,
                url: response["data"]["data"][0],
              });
              this.$store.dispatch("snackbar/setSnackbar", {
                text: `הקובץ @ הועלה לשרת בהצלחה`,
                param: this.files[0].name,
              });
              this.files = [];
              this.$refs.taskFileAdd.value = "";
            })
            .catch((error) => {
              this.isUplading = false;
              this.$store.dispatch("snackbar/setSnackbar", {
                color: "red",
                text: `אירעה שגיעה בהעלאת הקובץ `,
                param: this.files[0].name,
              });
              this.files = [];
              this.$refs.taskFileAdd.value = "";
            });
        }
      }
    },
    openURL(url) {
      window.open(this.$store.state.config.API_BASE_URL + url, "_blank");
    },
    removeFile(key) {
      this.value.files_url.splice(key, 1);
    },
    formatDate(date) {
      if (!date) return null;

      const [year, month, day] = date.split("-");
      return `${day}/${month}/${year}`;
    },
    async onFormChange(key, value) {
      let newTask = _.cloneDeep(this.value);
      newTask[key] = value;
      this.$emit("input", newTask);
    },
    onSave: function (validatePriorities = true) {
      if (this.$refs.form.validate()) {
        // let allDay = false;
        // if (this.value.start !== null && this.value.end !== null) {
        //   if (
        //     this.value.start.getMinutes() == 0 &&
        //     this.decreaseTimeZoneDiff(this.value.start).getHours() == 0 &&
        //     this.value.end.getMinutes() == 0 &&
        //     this.decreaseTimeZoneDiff(this.value.end).getHours() == 0
        //   ) {
        //     allDay = true;
        //   }
        // }
        // this.onFormChange("allDay", allDay);

        this.$emit("on-task-save", this.value.id, validatePriorities);
      } else {
        if (this.value.title) {
          this.$store.dispatch("snackbar/setSnackbar", {
            color: "red",
            text: `טופס לא תקין במשימה `,
            param: this.value.title,
          });
        } else {
          this.$store.dispatch("snackbar/setSnackbar", {
            color: "red",
            text: `לכל משיימה חייבת להיות כותרת`,
          });
        }
      }
    },
  },

  watch: {
    "value.domain_id": function (newDomainId) {
      console.log("domain_id changed watcher", newDomainId);
      let updatedTask = _.cloneDeep(this.value);
      let editable =
        this.$store.state.userData.permissions.includes("ADMIN") ||
        (this.$store.state.userData.permissions.includes("LEAD") &&
          this.$store.state.userData.domain_id == this.value.domain_id) ||
        this.value.domain_id == this.$store.state.config.OUT_SRC_DOMAIN_ID;
      updatedTask.editable = editable;
      if (!this.value.is_template) {
        let savedTask = this.$store.getters.getTask(this.value.id);

        if (updatedTask.id > 0) {
          if (newDomainId == savedTask.domain_id) {
            updatedTask.crew = savedTask.crew;
          } else {
            updatedTask.crew = [];
          }
          if (!editable) {
            updatedTask.start = savedTask.start;
            updatedTask.end = savedTask.end;
          }
        } else {
          if (!editable) {
            updatedTask.start = null;
            updatedTask.end = null;
          }
          updatedTask.crew = [];
        }
      } else {
        if (updatedTask.id > 0) {
          let savedTask = this.$store.getters["tasksTemplates/getTemplateTask"](
            this.value.father_id,
            this.value.id
          );
          if (newDomainId == savedTask.domain_id) {
            updatedTask.crew = savedTask.crew;
          } else {
            updatedTask.crew = [];
          }
        } else {
          updatedTask.crew = [];
        }
      }
      this.$emit("input", updatedTask);
    },
    "value.start": function (newStart) {
      this.$refs.form.validate();
    },
    "value.end": function (newStart) {
      this.$refs.form.validate();
    },
    equipmentSearch(val) {
      if (val != "" && val != null) {
        this.isEquipmenLoading = true;

        // Lazily load input items
        api
          .get("metadata/equipment/with-text", {
            params: {
              search_text: this.equipmentSearch,
            },
          })
          .then((res) => res.data)
          .then((res) => {
            // const { count, entries } = res;
            // this.count = count;
            // this.entries = entries;
            this.equipmenEntries = res;
          })
          .catch((err) => {
            //pass
          })
          .finally(() => (this.isEquipmenLoading = false));
      }
    },
    buildingSearch(val) {
      if (val != "" && val != null) {
        this.isBuildingLoading = true;

        // Lazily load input items
        api
          .get("metadata/buildings/with-text", {
            params: {
              search_text: this.buildingSearch,
            },
          })
          .then((res) => res.data)
          .then((res) => {
            // const { count, entries } = res;
            // this.count = count;
            // this.entries = entries;
            this.buildingsEntries = res;
          })
          .catch((err) => {
            //pass
          })
          .finally(() => (this.isBuildingLoading = false));
      }
    },
  },
};
</script>

<style computed>
.datetime-picker .v-text-field--is-booted {
  direction: ltr !important;
  width: 170px;
  margin-right: auto;
  margin-left: auto;
}

.datetime-picker
  .v-input
  .v-input__prepend-outer
  .v-input__icon--prepend
  .v-icon {
  color: #1976d2;
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

.title .v-messages {
  margin-top: 10px;
}

h3 {
  color: rgba(0, 0, 0, 0.6);
}
.fileTextOpen {
  display: inline-block;
  white-space: nowrap;
  overflow: hidden !important;
  text-overflow: ellipsis;
  vertical-align: bottom;
  cursor: pointer;
  font-size: 1rem;
}

.planningOpen {
  color: black;
  display: inline-block;
  width: 100%;
  white-space: nowrap;
  overflow: hidden !important;
  text-overflow: ellipsis;
  vertical-align: bottom;
  cursor: pointer;
  font-size: 1rem;
}

.action-button {
  width: calc(1vw + 25px) !important;
  height: calc(1vw + 25px) !important;
}

.fileList {
  display: inline-block;
  height: auto;
  max-height: 8vh;
  overflow-y: auto;
}
.fileList::-webkit-scrollbar {
  width: 9px;
  float: right;
}

.fileList::-webkit-scrollbar-track {
  background-color: rgba(170, 170, 170, 0.3);
}

.fileList::-webkit-scrollbar-thumb {
  background-color: gray;
}

td .v-input {
  height: 10px;
}

.disable-events {
  pointer-events: none;
}

.action-button-icon {
  font-size: 20px !important;
}
.visable-errors * .v-text-field__details {
  visibility: visible !important;
  margin-top: -22px;
}
</style>
