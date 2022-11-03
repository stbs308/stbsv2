<template>
  <v-row class="fill-height">
    <v-col>
      <v-sheet height="64">
        <!-- Calendar toolbar -->
        <v-toolbar flat color="white">
          <v-btn
            v-if="!categories.includes(userProps)"
            color="primary"
            class="mr-4"
            @click="dialog = true"
            dark
            >Schedule</v-btn
          >
          <!-- <v-btn outlined class="mr-4" color="grey darken-2" @click="setToday"
            >Today</v-btn
          > -->
          <v-btn fab text small color="grey darken-2" @click="prev"
            ><v-icon small>mdi-chevron-left</v-icon></v-btn
          >
          <v-btn fab text small color="grey darken-2" @click="next"
            ><v-icon small>mdi-chevron-right</v-icon></v-btn
          >
          <v-toolbar-title v-if="$refs.calendar">{{
            $refs.calendar.title
          }}</v-toolbar-title>
          <v-spacer></v-spacer>
          <v-menu bottom right
            ><template v-slot:activator="{ on, attrs }"
              ><v-btn outlined color="grey darken-2" v-bind="attrs" v-on="on"
                ><span>{{ typeToLabel[type] }}</span
                ><v-icon right>mdi-menu-down</v-icon></v-btn
              ></template
            >
            <v-list>
              <v-list-item @click="type = 'day'"
                ><v-list-item-title>Day</v-list-item-title></v-list-item
              >
              <v-list-item @click="type = 'week'"
                ><v-list-item-title>Week</v-list-item-title></v-list-item
              >
              <v-list-item @click="type = 'month'"
                ><v-list-item-title>Month</v-list-item-title></v-list-item
              >
              <v-list-item @click="type = '4day'"
                ><v-list-item-title>4 days</v-list-item-title></v-list-item
              >
              <v-list-item @click="setToday"
                ><v-list-item-title>Go to Today</v-list-item-title></v-list-item
              >
              <v-list-item
                v-if="userProps === 'admin'"
                @click="type = 'category'"
                ><v-list-item-title>Employee</v-list-item-title></v-list-item
              >
              <v-list-item @click="dialogFind = true"
                ><v-list-item-title>Search</v-list-item-title></v-list-item
              >
              <v-list-item
                v-if="userProps === 'admin'"
                @click="dialogCustomerTech = true"
                ><v-list-item-title>Customer/Tech</v-list-item-title></v-list-item
              >
            </v-list>
          </v-menu>
        </v-toolbar>
        <!-- Search -->
        <v-dialog max-width="1000" v-model="dialogFind">
          <v-card>
            <v-card-title>
              Schedule Search
              <v-spacer></v-spacer>
              <v-text-field
                v-model="search"
                append-icon="mdi-magnify"
                label="What are you looking for?"
                single-line
                hide-details
              ></v-text-field>
            </v-card-title>
            <v-data-table
              v-if="userProps === 'admin'"
              :headers="headers"
              :items="events"
              item-key="id"
              :search="search"
              :sort-by="['owner2', 'start']"
              :sort-desc="[false, true]"
              multi-sort
              class="elevation-1"
              :single-expand="true"
              :expanded.sync="expanded"
              show-expand
            >
              <template v-slot:expanded-item="{ item }">
                <v-col auto>
                  <h4>
                    ****************Customer_Notes*****************
                  </h4>
                  {{ item.details }}
                </v-col>
                <v-col align-self="center">
                  <h4>
                    *****************Techician_Notes***************
                  </h4>
                  {{ item.emp_notes }}
                </v-col>
                <v-col auto>
                  <h4>
                    *******************Admin_Notes*****************
                  </h4>
                  {{ item.admin_notes }}
                </v-col>
              </template>
            </v-data-table>
            <v-data-table
              v-else-if="categories.includes(userProps)"
              :headers="headersTech"
              :items="events"
              :search="search"
              :sort-by="['owner2', 'start']"
              :sort-desc="[false, true]"
              multi-sort
              class="elevation-1"
              :single-expand="true"
              :expanded.sync="expanded"
              show-expand
            >
              <template v-slot:expanded-item="{ item }">
                <v-col align-self="center">
                  <h4>
                    *****************Techician_Notes***************
                  </h4>
                  {{ item.emp_notes }}
                </v-col>
                <v-col auto>
                  <h4>
                    *******************Admin_Notes*****************
                  </h4>
                  {{ item.admin_notes }}
                </v-col>
              </template>
            </v-data-table>
            <v-data-table
              v-else-if="
                !categories.includes(userProps) || userProps !== 'admin'
              "
              :headers="headersCust"
              :items="events"
              :search="search"
              :sort-by="['owner2', 'start']"
              :sort-desc="[false, true]"
              multi-sort
              class="elevation-1"
              :single-expand="true"
              :expanded.sync="expanded"
              show-expand
            >
              <template v-slot:expanded-item="{ item }">
                <v-col auto>
                  <h4>
                    ****************Customer_Notes*****************
                  </h4>
                  {{ item.details }}
                </v-col>
              </template>
            </v-data-table>
          </v-card>
        </v-dialog>
        <!-- Create Event dialog -->
        <v-dialog v-model="dialog" max-width="500">
          <v-card v-bind:class="dialog_color">
            <v-container>
              <v-alert v-if="showError" dense type="error"
                >Required info missed or wrong date chosen *</v-alert
              >
              <v-text-field
                v-if="userProps === 'admin'"
                @click="resetError"
                v-model="start_date"
                type="date"
                label="Date of Service* (*=required)"
              ></v-text-field>
              <v-text-field
                v-else
                @click="resetError"
                v-model="start_date"
                type="date"
                label="Date of Service* (*=required)"
                :rules="rules"
              ></v-text-field>
              <v-text-field
                v-model="apt_num"
                label="Enter Apartment Number* (one per scheduled service)"
                @click="resetError"
              ></v-text-field>
              <v-row @click="resetError">
                <v-col cols="12" sm="2" md="2">
                  <v-label>Time*</v-label>
                  <v-radio-group v-model="time_of_day" column>
                    <v-radio label="AM" color="blue" value="AM"></v-radio>
                    <v-radio label="PM" color="blue " value="PM"></v-radio>
                    <v-radio
                      label="Anytime"
                      color="blue "
                      value="Anytime"
                    ></v-radio>
                  </v-radio-group>
                </v-col>
                <v-col cols="12" sm="4" md="4">
                  <v-label>Type*</v-label>
                  <v-radio-group v-model="apt_status" column>
                    <v-radio
                      label="Occupied"
                      color="blue"
                      value="Occupied"
                    ></v-radio>
                    <v-radio
                      label="Vacant"
                      color="blue "
                      value="Vacant"
                    ></v-radio>
                  </v-radio-group>
                </v-col>
                <v-col cols="12" sm="6" md="6">
                  <v-label>Service Category*</v-label>
                  <v-radio-group v-model="service_category" column>
                    <v-radio
                      label="Carpet Cleaning"
                      color="blue"
                      value="Carpet"
                    ></v-radio>
                    <v-radio
                      label="Housekeeping"
                      color="blue "
                      value="Housekeeping"
                    ></v-radio>
                    <v-radio
                      label="Paint"
                      color="blue "
                      value="Paint"
                    ></v-radio>
                    <v-radio
                      label="Other"
                      color="blue "
                      value="Other"
                    ></v-radio>
                  </v-radio-group>
                </v-col>
              </v-row>
              <v-container fluid>
                <v-row
                  v-if="userProps === 'admin'"
                  align="center"
                  @click="resetError"
                >
                  <v-col class="d-flex" cols="12" sm="6"
                    ><v-select
                      v-model="owner2"
                      :items="owners"
                      label="Customer*"
                      solo
                    ></v-select
                  ></v-col>
                  <v-col class="d-flex" cols="12" sm="6"
                    ><v-select
                      v-model="category"
                      :items="categories"
                      label="Technician*"
                      solo
                    ></v-select
                  ></v-col>
                </v-row>
              </v-container>
              <v-text-field
                v-model="details"
                type="text"
                label="Job Detail"
              ></v-text-field>
              <v-text-field
                v-model="created_by"
                type="text"
                label="Created By"
              ></v-text-field>
              <v-btn
                type="submit"
                color="primary"
                class="mr-4"
                @click.prevent="createEvent"
                >Create Event</v-btn
              >
            </v-container>
          </v-card>
        </v-dialog>
      </v-sheet>
      <v-sheet height="1000">
        <!-- Calendar -->
        <v-calendar
          ref="calendar"
          v-model="focus"
          color="primary"
          :first-interval="23"
          :interval-minutes="480"
          :interval-height="1"
          :event-margin-bottom="2"
          :events="events"
          :event-color="getEventColor"
          :type="type"
          :categories="categories"
          category-show-all
          @click:event="showEvent"
          @click:more="viewDay"
          @click:date="viewDay"
          @change="updateRange"
          class="px-5 mt-5"
        ></v-calendar>
        <!-- Editing the Event -->
        <v-menu
          v-model="selectedOpen"
          :close-on-content-click="false"
          :activator="selectedElement"
          offset-x
          :open-on-click="false"
        >
          <v-card color="grey lighten-4" flat class="mb-6">
            <v-toolbar :color="selectedEvent.color" dark>
              <v-btn
                v-if="userProps === 'admin'"
                @click.prevent="dialogDeleteConfirmation = true"
                icon
                ><v-icon>mdi-delete</v-icon></v-btn
              >
              <v-toolbar-title v-html="selectedEvent.name"></v-toolbar-title>
            </v-toolbar>

            <v-card-text>
              <!-- View Selected Event -->
              <form v-if="currentlyEditing !== selectedEvent.id">
                <div>
                  <h3>Customer Notes</h3>
                  {{ selectedEvent.details }}
                </div>
                <p></p>
                <!-- If user is admin show more items to be modified -->
                <div
                  v-if="userProps === 'admin' || categories.includes(userProps)"
                >
                  <h3>Technician Notes</h3>
                  {{ selectedEvent.emp_notes }}
                  <p></p>
                  <h3>Admin Notes</h3>
                  {{ selectedEvent.admin_notes }}
                  <p></p>
                  <div v-if="!categories.includes(userProps)">
                    <h3>Technician Name</h3>
                    {{ selectedEvent.category }}
                  </div>
                  <p></p>
                  <div v-if="!categories.includes(userProps)">
                    <h3>Created By</h3>
                    {{ selectedEvent.created_by }}
                  </div>
                </div>
              </form>
              <!-- Edit Selected Event -->
              <form v-else>
                <div v-if="userProps === selectedEvent.owner2">
                  <h3>Customer Notes</h3>
                  <v-textarea
                    v-model="selectedEvent.details"
                    auto-grow
                    filled
                    outlined
                    label="add note"
                  ></v-textarea>
                </div>
                <div v-else-if="userProps === 'admin'">
                  <h3>Customer Notes</h3>
                  {{ selectedEvent.details }}
                </div>
                <p></p>
                <div
                  v-if="userProps === 'admin' || categories.includes(userProps)"
                >
                  <h3>Technician Notes</h3>
                  <div v-if="categories.includes(userProps)">
                    <v-textarea
                      v-model="selectedEvent.emp_notes"
                      filled
                      outlined
                      auto-grow
                      label="add note"
                    ></v-textarea>
                  </div>
                  <div v-else>{{ selectedEvent.emp_notes }}</div>
                  <p></p>
                  <h3>Admin Notes</h3>
                  <div v-if="userProps === 'admin'">
                    <v-textarea
                      v-model="selectedEvent.admin_notes"
                      auto-grow
                      filled
                      outlined
                      label="add note"
                    ></v-textarea>
                  </div>
                  <div v-else>{{ selectedEvent.admin_notes }}</div>
                  <!-- DropDown for list of techs -->
                  <div
                    v-if="
                      userProps === 'admin' &&
                        selectedEvent.note_code !== 'COMP'
                    "
                  >
                    <h3>Technician Name</h3>
                    <v-container fluid>
                      <v-col class="d-flex" cols="12" sm="6">
                        <v-select
                          v-model="selectedEvent.category"
                          :items="categories"
                          label="Technician"
                          dense
                          solo
                        ></v-select>
                      </v-col>
                    </v-container>
                  </div>
                  <p></p>
                  <div v-if="selectedEvent.note_code === 'COMP'">
                    <h3>Technician Name</h3>
                    {{ selectedEvent.category }}
                  </div>
                </div>
              </form>
            </v-card-text>
            <v-card-actions>
              <v-btn text color="secondary" @click="closeEvent">Close</v-btn>
              <div v-if="selectedEvent.note_code === 'CANC'"></div>
              <div v-else-if="currentlyEditing !== selectedEvent.id">
                <v-btn text @click.prevent="editEvent(selectedEvent)"
                  >Edit</v-btn
                >
              </div>
              <v-btn text v-else @click.prevent="updateEvent(selectedEvent)"
                >Save</v-btn
              >
              <v-btn
                text
                v-if="
                  !categories.includes(userProps) &&
                    userProps !== 'admin' &&
                    selectedEvent.note_code !== 'CANC' &&
                    selectedEvent.note_code !== 'COMP' &&
                    selectedEvent.note_code !== 'INV'
                "
                @click.prevent="dialogCancelConfirmation = true"
                >Cancel Job</v-btn
              >
              <v-btn
                text
                v-if="
                  (categories.includes(userProps) &&
                    selectedEvent.color === 'orange') ||
                    (userProps === 'admin' && selectedEvent.color === 'orange')
                "
                @click.prevent="ackEvent(selectedEvent)"
                >Acknowledge</v-btn
              >
              <v-spacer></v-spacer>
              <v-btn
                text
                v-if="
                  selectedEvent.color === 'black' &&
                    categories.includes(userProps)
                "
                @click="dialogCompleteConfirmation = true"
                >Done</v-btn
              >
              <v-btn
                text
                v-if="selectedEvent.color === 'blue' && userProps === 'admin'"
                @click="dialogInvoiceConfirmation = true"
                >Invoice</v-btn
              >
            </v-card-actions>
          </v-card>
          <!-- Delete Confirmation -->
          <v-row justify="center">
            <v-dialog
              v-model="dialogDeleteConfirmation"
              persistent
              max-width="290"
            >
              <v-card>
                <v-card-title
                  class="error headline"
                  style="font-weight:bold; color:white;"
                  >Confirm Delete</v-card-title
                >
                <v-card-text
                  >Are you sure you want to delete? This cannot be
                  undone.</v-card-text
                >
                <v-card-actions>
                  <v-spacer></v-spacer>
                  <v-btn text @click="dialogDeleteConfirmation = false"
                    >Close</v-btn
                  >
                  <v-btn color="error" text @click="deleteEvent(selectedEvent)"
                    >Confirm Delete</v-btn
                  >
                </v-card-actions>
              </v-card>
            </v-dialog>
          </v-row>
          <!-- Cancel Confirmation -->
          <v-row justify="center">
            <v-dialog
              v-model="dialogCancelConfirmation"
              persistent
              max-width="290"
            >
              <v-card>
                <v-card-title
                  class="black headline"
                  style="font-weight:bold; color:white;"
                  >Confirm Cancel</v-card-title
                >
                <v-card-text
                  >Are you sure you want to cancel? This cannot be undone. You
                  will have to resubmit if you feel you still need it
                  afterwards.</v-card-text
                >
                <v-card-actions>
                  <v-spacer></v-spacer>
                  <v-btn text @click="dialogCancelConfirmation = false"
                    >Close</v-btn
                  >
                  <v-btn color="error" text @click="cancelEvent(selectedEvent)"
                    >Confirm Cancel</v-btn
                  >
                </v-card-actions>
              </v-card>
            </v-dialog>
          </v-row>
          <!-- Complete Confirmation -->
          <v-row justify="center">
            <v-dialog
              v-model="dialogCompleteConfirmation"
              persistent
              max-width="290"
            >
              <v-card>
                <v-card-title
                  class="blue headline"
                  style="font-weight:bold; color:white;"
                  >Confirm Complete</v-card-title
                >
                <v-card-text
                  >Are you sure you want to set status to complete? This cannot
                  be undone.</v-card-text
                >
                <v-card-actions>
                  <v-spacer></v-spacer>
                  <v-btn text @click="dialogCompleteConfirmation = false"
                    >Close</v-btn
                  >
                  <v-btn color="blue" text @click="completeEvent(selectedEvent)"
                    >Confirm Complete</v-btn
                  >
                </v-card-actions>
              </v-card>
            </v-dialog>
          </v-row>
          <!-- Invoice Confirmation -->
          <v-row justify="center">
            <v-dialog
              v-model="dialogInvoiceConfirmation"
              persistent
              max-width="290"
            >
              <v-card>
                <v-card-title
                  class="green headline"
                  style="font-weight:bold; color:white;"
                  >Confirm Invoice</v-card-title
                >
                <v-card-text
                  >Are you sure you want to set status to invoice? This cannot
                  be undone.</v-card-text
                >
                <v-card-actions>
                  <v-spacer></v-spacer>
                  <v-btn text @click="dialogInvoiceConfirmation = false"
                    >Close</v-btn
                  >
                  <v-btn color="green" text @click="invoiceEvent(selectedEvent)"
                    >Confirm Invoice</v-btn
                  >
                </v-card-actions>
              </v-card>
            </v-dialog>
          </v-row>
        </v-menu>
      </v-sheet>
      <!-- Alert if there's new job -->
      <v-dialog
        v-if="userProps === 'admin'"
        v-model="newJobAlert"
        persistent
        max-width="290"
      >
        <v-card>
          <v-card-title
            class="red headline"
            style="font-weight:bold; color:white;"
            >New Jobs Alert!</v-card-title
          >
          <v-card-text>Please assign technicians to new jobs</v-card-text>
          <v-card-actions>
            <v-spacer></v-spacer>
            <v-btn text @click="newJobAlert = false">Close</v-btn>
            <!-- <v-btn color="red" text @click="playSound()">Assign Tech</v-btn> -->
          </v-card-actions>
        </v-card>
      </v-dialog>
    </v-col>
  </v-row>
</template>

<script>
import { useSound } from "@vueuse/sound";
import buttonSfx from "../assets/audio.mp3";
import { listCalEvents, listCustomerTeches } from "@/graphql/queries";
import {
  newOnCreateCalEvent,
  newOnUpdateCalEvent,
  newOnDeleteCalEvent,
  techOnDeleteCalEvent,
  techOnUpdateCalEvent,
  techOnCreateCalEvent,
  custOnCreateCalEvent,
  custOnUpdateCalEvent,
  custOnDeleteCalEvent,
} from "@/graphql/subscriptions";
import { API, graphqlOperation } from "aws-amplify";
import {
  createCalEvent,
  updateCalEvent,
  deleteCalEvent,
} from "@/graphql/mutations";
export default {
  props: ["userProps"],
  data: () => ({
    dialogCustomerTech: false,
    customerTechs: [],
    focus: "",
    type: "month",
    typeToLabel: {
      month: "Month",
      week: "Week",
      day: "Day",
      "4day": "4 Days",
      category: "Employee",
    },
    rules: [
      (v) =>
        new Date().setHours(0, 0, 0, 0) <=
          new Date(v.replace(/-/g, "/")).setHours(0, 0, 0, 0) ||
        "Date must be today or newer",
    ],
    // corners_complex: ['east', 'west'],
    created_by: "",
    calendars: undefined,
    dialogFind: false,
    dialog_color: null,
    copyDelete: "on",
    searchApt: null,
    showError: false,
    diffInDays: null,
    service_category: null,
    apt_num: "",
    apt_status: null,
    before_details_value: null,
    before_emp_notes_value: null,
    before_admin_notes_value: null,
    before_category_value: null,
    before_color_value: null,
    service_needed: null,
    name: null,
    details: null,
    start: null,
    start_date: new Date().toISOString().substr(0, 10),
    // start_date: null,
    // start_time: "08:00",
    end: null,
    // end_time: "12:00",
    time_of_day: null,
    color: null,
    currentlyEditing: null,
    selectedEvent: {},
    selectedElement: null,
    selectedOpen: false,
    events: [],
    dialog: false,
    names: [],
    colors: [],
    time_of_days: ["AM", "PM"],
    apt_statuss: ["Occupied", "Vacant"],
    service_categories: ["Carpet", "Housekeeping", "Paint", "Other"],
    category: null,
    categories: [
      // "agapito",
      // "cesar",
      // "conrrado",
      // "eduardo",
      // "hugo",
      // "jose", 
      // "karen",
      // "leo",
      // "maria",
      // "martin",
      // "pablo",
      // "resurface",
      // "vero",
      // "victor",
      // "technician1",
      // "technician2",
    ],
    selectedEmp: [],
    newJobAlert: false,
    owner2: null,
    owners: [
      // "amp",
      // "apex",
      // "arioso",
      // "arlington",
      // "ash",
      // "aura",
      // "bnf",
      // "cedar",
      // "chase",
      // "circuit-side",
      // "cliffs",
      // "corners",
      // "corners-east",
      // "current-side",
      // "dakota",
      // "drey",
      // "durham",
      // "elan",
      // "gate",
      // "gateway",
      // "hill",
      // "holston",
      // "huntington",
      // "interurban",
      // "kace",
      // "lakes",
      // "live-oaks",
      // "loftrow",
      // "lucas",
      // "magnmay",
      // "meadow",
      // "montage-southside",
      // "northbridge",
      // "park",
      // "radius",
      // "riviera",
      // "stonebriar",
      // "teak",
      // "tealwood",
      // "truman",
      // "uppereastside",
      // "verandas",
      // "westside",
      // "customer1",
      // "customer2",
    ],
    note_code: null,
    search: "",
    headers: [
      { text: "Date", align: "start", value: "start" },
      { text: "Customer", value: "owner2" },
      { text: "Technician", value: "category" },
      { text: "Apt No.", value: "apt_num" },
      { text: "Color", value: "color" },
      { text: "Time of Day", value: "time_of_day" },
      { text: "Service", value: "service_category" },
      { text: "Status", value: "apt_status" },
      { text: "", value: "data-table-expand" },
    ],
    headersTech: [
      { text: "Date", align: "start", value: "start" },
      { text: "Customer", value: "owner2" },
      { text: "Apt No.", value: "apt_num" },
      { text: "Time of Day", value: "time_of_day" },
      { text: "Service", value: "service_category" },
      { text: "Status", value: "apt_status" },
      { text: "", value: "data-table-expand" },
    ],
    headersCust: [
      { text: "Date", align: "start", value: "start" },
      { text: "Apt No.", value: "apt_num" },
      { text: "Time of Day", value: "time_of_day" },
      { text: "Service", value: "service_category" },
      { text: "Status", value: "apt_status" },
      { text: "", value: "data-table-expand" },
    ],
    invalidDate: false,
    setNextToken: undefined,
    today: new Date(),
    dialogDeleteConfirmation: false,
    dialogCancelConfirmation: false,
    dialogCompleteConfirmation: false,
    dialogInvoiceConfirmation: false,
    singleExpand: false,
    expanded: [],
  }),
  setup() {
    const { play } = useSound(buttonSfx);
    return {
      play,
    };
  },
  computed: {
    playSound() {
      return this.play;
    },
  },
  created() {
    this.subscribeCal();
    this.getCustomerTech()
  },
  mounted() {
    this.$refs.calendar.checkChange();
    this.getCalEvents();
    if (this.categories.indexOf(this.userProps) >= 0) {
      this.type = "day";
    }
    //   else if (this.userProps === 'admin'){
    //     this.type='month'
    // }
  },
  methods: {
    async getCustomerTech(){
      const { data } = await API.graphql({
        query: listCustomerTeches,
        variables: { limit: 1000 }
      })
      data.listCustomerTeches.items.forEach((item) => {
        this.customerTechs.push({
          username: item.username,
          category: item.category,
          assigned: item.assigned
        })
      })
      const category = this.customerTechs.filter(
        (item) => item.category === "T"
      )
      const owner = this.customerTechs.filter(
        (item) => item.category === "C"
      )

      category.sort((a,b) => a.username.localeCompare(b.username))
      owner.sort((a,b) => a.username.localeCompare(b.username))

      category.forEach((item) => {
        this.categories.push(item.username)
      })

      owner.forEach((item) => {
        this.owners.push(item.username)
      })
    },
    async subscribeCal() {
      // EH1
      // If admin
      const that = this;
      if (this.userProps === "admin") {
        API.graphql({ query: newOnCreateCalEvent }).subscribe({
          next: (eventData) => {
            that.events.push(eventData.value.data.newOnCreateCalEvent);
            if (this.copyDelete === "off") {
              // do nothing
              console.log("**** do nothing");
            } else {
              this.playSound();
              this.newJobAlert = true;
              console.log("**** alert ");
            }
            // Fix this to refresh only newly created data and rest of other subcriptions
            this.getCalEvents();
            console.log("subs on create");
            this.copyDelete = "on";
          },
          error: (error) => console.warn(error),
        });

        // API.graphql({ query: newOnCreateCalEvent })
        // .subscribe({
        //   next: (eventData) => {
        //     that.events.push(eventData.value.data.newOnCreateCalEvent)
        //     // let event = eventData.value.data.newOnCreateCalEvent;
        //     // if (this.events.some(item => item.name === event.name)) return; // remove duplications
        //     // this.events = [...this.events, event]
        //     this.jobAlert()
        //     this.getCalEvents()

        //   }, error: error => console.warn(error)
        // });
        API.graphql({ query: newOnUpdateCalEvent }).subscribe({
          next: (eventUpdateData) => {
            that.events.push(eventUpdateData.value.data.newOnUpdateCalEvent);
            // const ev=eventUpdateData.value.data.newOnUpdateCalEvent
            // this.selectedEvent.name=ev.time_of_day + " - " + ev.owner2 + " - " + ev.service_category + " - " + ev.apt_num + " - " + " - " + ev.apt_status + " - " + ev.category
            this.getCalEvents();
            // console.log("sub newOnUpdateData")
            // console.log("-----------")
            // console.log("==== Color ====")
            // console.log("this.color - " + this.color)
            // console.log("this.selectedEvent.color - " + this.selectedEvent.color)
            // console.log("subs.color - " + eventUpdateData.value.data.newOnUpdateCalEvent.color)
            // this.selectedEvent.color=ev.color
            // this.selectedEvent.details=ev.details
            // this.selectedEvent.emp_notes=ev.emp_notes
            // this.selectedEvent.admin_notes=ev.admin_notes
          },
          error: (error) => console.warn(error),
        });
        API.graphql({ query: newOnDeleteCalEvent }).subscribe({
          next: (eventDeleteData) => {
            that.events.push(eventDeleteData.value.data.newOnDeleteCalEvent);
            this.getCalEvents();
          },
          error: (error) => console.warn(error),
        });
      } else {
        // technician subs
        API.graphql(
          graphqlOperation(techOnCreateCalEvent, {
            category: this.userProps,
          })
        ).subscribe({
          next: (eventTechCreateData) => {
            that.events.push(
              eventTechCreateData.value.data.techOnCreateCalEvent
            );
            this.getCalEvents();
          },
          error: (error) => console.warn(error),
        });

        API.graphql(
          graphqlOperation(techOnUpdateCalEvent, {
            category: this.userProps,
          })
        ).subscribe({
          next: (eventTechUpdateData) => {
            that.events.push(
              eventTechUpdateData.value.data.techOnUpdateCalEvent
            );
            const ev = eventTechUpdateData.value.data.techOnUpdateCalEvent;
            // if (ev.color === 'brown'){
            //   this.selectedEvent.color='orange'
            // }
            // else if (ev.color==='black'){
            //   this.selectedEvent.color='black'
            // }
            // this.selectedEvent.name=this.name

            // when technician is having funky colors from a previous issue
            // this.color=this.selectedEvent.color

            console.log("sub eventTechUpdateData");
            console.log("-----------");
            console.log("==== Color ====");
            console.log("this.color - " + this.color);
            console.log(
              "this.selectedEvent.color - " + this.selectedEvent.color
            );
            console.log("subs.color - " + ev.color);
            this.getCalEvents();
          },
          error: (error) => console.warn(error),
        });
        API.graphql(
          graphqlOperation(techOnDeleteCalEvent, {
            category: this.userProps,
          })
        ).subscribe({
          next: (eventTechDeleteData) => {
            that.events.push(
              eventTechDeleteData.value.data.techOnDeleteCalEvent
            );
            this.getCalEvents();
            console.log("Delete from Tech");
          },
          error: (error) => console.warn(error),
        });
        // customer subs
        API.graphql(
          graphqlOperation(custOnCreateCalEvent, {
            owner2: this.userProps,
          })
        ).subscribe({
          next: (eventCustCreateData) => {
            that.events.push(
              eventCustCreateData.value.data.custOnCreateCalEvent
            );
            this.getCalEvents();
          },
          error: (error) => console.warn(error),
        });
        API.graphql(
          graphqlOperation(custOnUpdateCalEvent, {
            owner2: this.userProps,
          })
        ).subscribe({
          next: (eventCustUpdateData) => {
            that.events.push(
              eventCustUpdateData.value.data.custOnUpdateCalEvent
            );
            // this.selectedEvent=eventCustUpdateData.value.data.custOnUpdateCalEvent
            // this.selectedEvent.name=this.name
            // this.selectedEvent.color=this.color
            this.getCalEvents();
          },
          error: (error) => console.warn(error),
        });
        API.graphql(
          graphqlOperation(custOnDeleteCalEvent, {
            owner2: this.userProps,
          })
        ).subscribe({
          next: (eventCustDeleteData) => {
            that.events.push(
              eventCustDeleteData.value.data.custOnDeleteCalEvent
            );
            this.getCalEvents();
            console.log("Deleted from Customer");
          },
          error: (error) => console.warn(error),
        });
      }
    },
    async getCalEvents() {
      // if user is technician
      if (this.categories.indexOf(this.userProps) >= 0) {
        // Using the below for now but should move to the new PartiSQL of AWS DynamoDB
        // calendar 1 is the retrieval of the first 1000 fetches; calendar 2 is the second 1000 fetches... and so on
        // When "Start Preparing for calendar4" is seen in console log, must do something to avoid having data to disappear

        let filter = { category: { eq: this.userProps } };
        const calendar1 = await API.graphql({
          query: listCalEvents,
          variables: { limit: 1000, filter: filter },
        });
        this.setNextToken = calendar1.data.listCalEvents.nextToken;
        const setCalendar1 = calendar1.data.listCalEvents.items;
        this.calendars = setCalendar1;

        //calendar 2
        if (this.setNextToken !== null) {
          const calendar2 = await API.graphql({
            query: listCalEvents,
            variables: {
              limit: 1000,
              filter: filter,
              nextToken: this.setNextToken,
            },
          });
          const setCalendar2 = calendar2.data.listCalEvents.items;
          this.setNextToken = calendar2.data.listCalEvents.nextToken;
          console.log("Tech - Start Preparing for calendar3");
          this.calendars = setCalendar1.concat(setCalendar2);
        } else {
          console.log("Tech - Not using calendar 2 yet");
        }

        // calendar 3
        if (this.setNextToken !== null) {
          const calendar3 = await API.graphql({
            query: listCalEvents,
            variables: {
              limit: 1000,
              filter: filter,
              nextToken: this.setNextToken,
            },
          });
          const setCalendar3 = (calendar3.data.listCalEvents.this.setNextToken =
            calendar3.data.listCalEvents.nextToken);
          console.log("Tech - Start Preparing for calendar4");
          this.calendars = this.calendars.concat(setCalendar3);
        } else {
          console.log("Tech - Not using calendar 3 yet");
        }
        const eventsorig = this.calendars;
        let events = [];
        let ce = eventsorig;
        ce.forEach((doc) => {
          if (doc.note_code === "NBA") {
            this.color = "orange";
            this.name =
              doc.time_of_day +
              " - " +
              doc.owner2 +
              " - " +
              doc.service_category +
              " - " +
              doc.apt_num +
              " - " +
              doc.apt_status;
          } else if (doc.note_code === "NBT") {
            this.color = "brown";
            this.name =
              doc.time_of_day +
              " - " +
              doc.owner2 +
              " - " +
              doc.service_category +
              " - " +
              doc.apt_num +
              " - " +
              doc.apt_status;
            this.selectedEvent.color = this.color;
          } else if (doc.note_code === "NBC") {
            this.color = "black";
            this.name =
              doc.time_of_day +
              " - " +
              doc.owner2 +
              " - " +
              doc.service_category +
              " - " +
              doc.apt_num +
              " - " +
              doc.apt_status;
          } else if (doc.note_code === "CANC") {
            this.name =
              "CANCELLED - " +
              doc.time_of_day +
              " - " +
              doc.owner2 +
              " - " +
              doc.service_category +
              " - " +
              doc.apt_num +
              " - " +
              doc.apt_status;
            this.color = doc.color;
          } else if (doc.note_code === "INV") {
            this.name =
              "INV - " +
              doc.time_of_day +
              " - " +
              doc.owner2 +
              " - " +
              doc.service_category +
              " - " +
              doc.apt_num +
              " - " +
              doc.apt_status;
            this.color = doc.color;
          } else if (doc.note_code === "COMP") {
            this.name =
              "DONE - " +
              doc.time_of_day +
              " - " +
              doc.owner2 +
              " - " +
              doc.service_category +
              " - " +
              doc.apt_num +
              " - " +
              doc.apt_status;
            this.color = doc.color;
          } else {
            this.name =
              doc.time_of_day +
              " - " +
              doc.owner2 +
              " - " +
              doc.service_category +
              " - " +
              doc.apt_num +
              " - " +
              doc.apt_status;
            this.color = doc.color;
          }
          events.push({
            id: doc.id,
            owner2: doc.owner2,
            start: doc.start,
            end: doc.end,
            name: this.name,
            color: this.color,
            details: doc.details,
            category: doc.category,
            emp_notes: doc.emp_notes,
            admin_notes: doc.admin_notes,
            note_code: doc.note_code,
            time_of_day: doc.time_of_day,
            apt_num: doc.apt_num,
            apt_status: doc.apt_status,
            service_category: doc.service_category,
            created_by: doc.created_by,
          });
        });
        this.events = events.sort((a, b) => a.name.localeCompare(b.name));

        // if user is admin
      } else if (this.userProps === "admin") {
        // Using the below for now but should move to the new PartiSQL of AWS DynamoDB
        // calendar 1 is the retrieval of the first 1000 fetches; calendar 2 is the second 1000 fetches... and so on
        // When "Start Preparing for calendar4" is seen in console log, must do something to avoid having data to disappear

        const calendar1 = await API.graphql({
          query: listCalEvents,
          variables: { limit: 1000 },
        });
        this.setNextToken = calendar1.data.listCalEvents.nextToken;
        const setCalendar1 = calendar1.data.listCalEvents.items;
        this.calendars = setCalendar1;

        // calendar 2
        if (this.setNextToken !== null) {
          const calendar2 = await API.graphql({
            query: listCalEvents,
            variables: { limit: 1000, nextToken: this.setNextToken },
          });
          const setCalendar2 = calendar2.data.listCalEvents.items;
          this.setNextToken = calendar2.data.listCalEvents.nextToken;
          console.log("Start Preparing for calendar3");
          this.calendars = setCalendar1.concat(setCalendar2);
        } else {
          console.log("Not using calendar 2 yet");
        }

        // calendar 3
        if (this.setNextToken !== null) {
          const calendar3 = await API.graphql({
            query: listCalEvents,
            variables: { limit: 1000, nextToken: this.setNextToken },
          });
          const setCalendar3 = calendar3.data.listCalEvents.items;
          this.setNextToken = calendar3.data.listCalEvents.nextToken;
          console.log("Start Preparing for calendar4");
          this.calendars = this.calendars.concat(setCalendar3);
        } else {
          console.log("Not using calendar 3 yet");
        }

        const eventsorig = this.calendars;
        let events = [];
        let ce = eventsorig;
        ce.forEach((doc) => {
          if (doc.note_code === "CANC") {
            this.name =
              "CANCELLED - " +
              doc.time_of_day +
              " - " +
              doc.owner2 +
              " - " +
              doc.service_category +
              " - " +
              doc.apt_num +
              " - " +
              doc.apt_status;
            this.color = doc.color;
          } else if (doc.note_code === "INV") {
            this.name =
              "INV - " +
              doc.time_of_day +
              " - " +
              doc.owner2 +
              " - " +
              doc.service_category +
              " - " +
              doc.apt_num +
              " - " +
              doc.apt_status;
            this.color = doc.color;
          } else if (doc.note_code === "COMP") {
            this.name =
              "DONE - " +
              doc.time_of_day +
              " - " +
              doc.owner2 +
              " - " +
              doc.service_category +
              " - " +
              doc.apt_num +
              " - " +
              doc.apt_status;
            this.color = doc.color;
          } else if (doc.category === null) {
            this.name =
              doc.time_of_day +
              " - " +
              doc.owner2 +
              " - " +
              doc.service_category +
              " - " +
              doc.apt_num +
              " - " +
              doc.apt_status;
          } else {
            this.name =
              doc.time_of_day +
              " - " +
              doc.owner2 +
              " - " +
              doc.service_category +
              " - " +
              doc.apt_num +
              " - " +
              doc.apt_status +
              " - " +
              doc.category;
          }
          events.push({
            id: doc.id,
            owner2: doc.owner2,
            start: doc.start,
            end: doc.end,
            name: this.name,
            color: doc.color,
            details: doc.details,
            category: doc.category,
            emp_notes: doc.emp_notes,
            admin_notes: doc.admin_notes,
            note_code: doc.note_code,
            time_of_day: doc.time_of_day,
            apt_num: doc.apt_num,
            apt_status: doc.apt_status,
            service_category: doc.service_category,
            created_by: doc.created_by,
          });
        });
        this.events = events.sort((a, b) => a.name.localeCompare(b.name));
        // if customer
      } else {
        let filter = { owner2: { eq: this.userProps } };
        // Using the below for now but should move to the new PartiSQL of AWS DynamoDB
        // calendar 1 is the retrieval of the first 1000 fetches; calendar 2 is the second 1000 fetches... and so on
        // When "Start Preparing for calendar4" is seen in console log, must do something to avoid having data to disappear

        const calendar1 = await API.graphql({
          query: listCalEvents,
          variables: { limit: 1000, filter: filter },
        });
        this.setNextToken = calendar1.data.listCalEvents.nextToken;
        const setCalendar1 = calendar1.data.listCalEvents.items;
        this.calendars = setCalendar1;

        //calendar 2
        if (this.setNextToken !== null) {
          const calendar2 = await API.graphql({
            query: listCalEvents,
            variables: {
              limit: 1000,
              filter: filter,
              nextToken: this.setNextToken,
            },
          });
          const setCalendar2 = calendar2.data.listCalEvents.items;
          this.setNextToken = calendar2.data.listCalEvents.nextToken;
          console.log("Cust - Start Preparing for calendar3");
          this.calendars = setCalendar1.concat(setCalendar2);
        } else {
          console.log("Cust - Not using calendar 2 yet");
        }

        // calendar 3
        if (this.setNextToken !== null) {
          const calendar3 = await API.graphql({
            query: listCalEvents,
            variables: {
              limit: 1000,
              filter: filter,
              nextToken: this.setNextToken,
            },
          });
          const setCalendar3 = calendar3.data.listCalEvents.items;
          this.setNextToken = calendar3.data.listCalEvents.nextToken;
          console.log("Cust - Start Preparing for calendar4");
          this.calendars = this.calendars.concat(setCalendar3);
        } else {
          console.log("Cust - Not using calendar 3 yet");
        }

        const eventsorig = this.calendars;
        let events = [];
        let ce = eventsorig;
        ce.forEach((doc) => {
          // if cancelled, then display name
          if (doc.note_code === "CANC") {
            this.name =
              "CANCELLED - " +
              doc.time_of_day +
              " - " +
              doc.service_category +
              " - " +
              doc.apt_num +
              " - " +
              doc.apt_status;
            this.color = "grey";
          } else if (doc.note_code === "INV") {
            this.name =
              "INV - " +
              doc.time_of_day +
              " - " +
              doc.service_category +
              " - " +
              doc.apt_num +
              " - " +
              doc.apt_status;
            this.color = "green";
          } else if (doc.note_code === "COMP") {
            this.name =
              "DONE - " +
              doc.time_of_day +
              " - " +
              doc.service_category +
              " - " +
              doc.apt_num +
              " - " +
              doc.apt_status;
            this.color = "blue";
            // if not cancelled, then show only customer pertinent information
          } else {
            this.name =
              doc.time_of_day +
              " - " +
              doc.service_category +
              " - " +
              doc.apt_num +
              " - " +
              doc.apt_status;
            this.color = "black";
          }

          events.push({
            id: doc.id,
            owner2: doc.owner2,
            start: doc.start,
            end: doc.end,
            name: this.name,
            color: this.color,
            details: doc.details,
            category: doc.category,
            emp_notes: doc.emp_notes,
            admin_notes: doc.admin_notes,
            note_code: doc.note_code,
            time_of_day: doc.time_of_day,
            apt_num: doc.apt_num,
            apt_status: doc.apt_status,
            service_category: doc.service_category,
            created_by: doc.created_by,
          });
        });
        this.events = events.sort((a, b) => a.name.localeCompare(b.name));
      }
    },
    async createEvent() {
      // set time based on am/pm
      if (this.time_of_day === "PM") {
        this.start_time = "12:00";
        this.end_time = "16:00";
      }
      // if technician is assigned, color is black, else red
      if (this.category !== null) {
        this.color = "black";
      } else {
        this.color = "red";
      }
      // if owner2 is set, service is scheduled by admin... if not schedule by admin owner2 = logged in user
      if (this.owner2 === null) {
        this.owner2 = this.userProps;
      }

      // // Every new service scheduled will have a note_code of NBC
      // this.note_code = 'NBC'

      // if technician is assigned, attach it to job name, else nothing
      // if (this.category !== null){
      //   this.name = this.time_of_day  + " - " + this.owner2 + " - " + this.service_category + " - " + this.apt_num + " - " + this.apt_status + " - " + this.category;
      // } else {
      //   this.name = this.time_of_day  + " - " + this.owner2 + " - " + this.service_category + " - " + this.apt_num + " - " + this.apt_status;
      // }
      this.start = this.start_date;
      this.end = this.start_date;
      // this.start = this.start_date + " " + this.start_time
      // console.log(this.start)
      //   this.end = new Date(this.start_date + " " + this.end_time)
      //   this.end = new Date(Date.parse(this.start_date + " " + this.end_time))
      // this.end = this.start_date + " " + this.end_time
      // console.log(this.end)
      // this.name2 = this.service_category + " - " + this.apt_num + " - " + this.apt_status;
      this.name = "";
      const {
        name,
        details,
        start,
        end,
        time_of_day,
        color,
        category,
        owner2,
        service_category,
        apt_num,
        apt_status,
        created_by,
      } = this;
      const calendar = {
        name,
        details,
        start,
        end,
        time_of_day,
        color,
        category,
        owner2,
        service_category,
        apt_num,
        apt_status,
        created_by,
      };

      // Make field mandatory
      // If user is admin and all info are available, then create record
      if (
        this.userProps === "admin" &&
        this.apt_num &&
        this.start &&
        this.time_of_day &&
        this.apt_status &&
        this.service_category &&
        this.owner2 &&
        this.category
      ) {
        await API.graphql({
          query: createCalEvent,
          variables: { input: calendar },
        });
        this.clearRecords();
      }
      // Else if not admin and user with customer info, create record
      else if (
        this.userProps !== "admin" &&
        this.apt_num &&
        this.start &&
        this.time_of_day &&
        this.apt_status &&
        this.service_category &&
        new Date().setHours(0, 0, 0, 0) <=
          new Date(this.start_date.replace(/-/g, "/")).setHours(0, 0, 0, 0)
      ) {
        await API.graphql({
          query: createCalEvent,
          variables: { input: calendar },
        });
        this.clearRecords();
      } else {
        this.showError = true;
        this.dialog_color = "red lighten-5";
      }
      // EH 1
      // this.getCalEvents()
    },
    resetError() {
      this.showError = false;
      this.dialog_color = null;
    },
    clearRecords() {
      this.dialog = false;
      this.showError = false;
      this.name = null;
      this.name2 = null;
      this.owner2 = null;
      this.details = null;
      this.start = null;
      this.time_of_day = null;
      this.admin_notes = null;
      this.emp_notes = null;
      this.category = null;
      this.apt_num = null;
      this.apt_status = null;
      this.service_category = null;
      this.selectedEvent = {};
      this.start_date = null;
    },
    editEvent(ev) {
      this.currentlyEditing = ev.id;
    },
    async cancelEvent(ev) {
      ev.color = "grey";
      ev.note_code = "CANC";
      console.log("canc log" + ev.start_date);

      const calEventDetails = {
        id: ev.id,
        color: ev.color,
        note_code: ev.note_code,
        name: "CANCELLED " + "- " + ev.name,
      };
      await API.graphql({
        query: updateCalEvent,
        variables: { input: calEventDetails },
      });

      this.selectedOpen = false;
      this.dialogCancelConfirmation = false;
      this.currentlyEditing = null;
    },
    async updateEvent(ev) {
      this.copyDelete = "on";
      if (ev.note_code === "INV") {
        this.color = "green";
        this.note_code = "INV";
        const calEventDetails = {
          id: this.currentlyEditing,
          details: ev.details,
          emp_notes: ev.emp_notes,
          admin_notes: ev.admin_notes,
        };
        await API.graphql({
          query: updateCalEvent,
          variables: { input: calEventDetails },
        });
        // * if there's a change in technician assignment... ONLY ADMIN can perform this
      } else if (ev.note_code === "COMP") {
        this.color = "blue";
        this.note_code = "COMP";
        const calEventDetails = {
          id: this.currentlyEditing,
          details: ev.details,
          emp_notes: ev.emp_notes,
          admin_notes: ev.admin_notes,
        };
        await API.graphql({
          query: updateCalEvent,
          variables: { input: calEventDetails },
        });
        // * if there's a change in technician assignment... ONLY ADMIN can perform this
      } else if (this.before_category_value != this.selectedEvent.category) {
        console.log("assigning tech");
        // ** A - if there's no technician currently assigned
        if (this.before_category_value === null) {
          console.log("A1");
          // *** A1 - if notes r added
          if (this.before_admin_notes_value != this.selectedEvent.admin_notes) {
            console.log(
              "Technician is not previously assigned but notes r added"
            );
            this.note_code = "NBA";
            this.color = "brown";
            // *** A2 - if notes r NOT modified... category already in graphql
          } else {
            console.log("A2");
            if (ev.code === "NBA") {
              this.color = "brown";
            } else if (ev.code === "NBC") {
              this.color = "orange";
            } else {
              this.color = "black";
            }
          }
          const calEventDetails = {
            id: this.currentlyEditing,
            note_code: this.note_code,
            color: this.color,
            category: ev.category,
            admin_notes: ev.admin_notes,
          };
          await API.graphql({
            query: updateCalEvent,
            variables: { input: calEventDetails },
          });
        } // this is where A ends

        // ** B if there's technician previously assigned
        else {
          // *** B1 - notes r added
          if (this.before_admin_notes_value != this.selectedEvent.admin_notes) {
            console.log("B1");
            this.admin_notes = ev.admin_notes;
            this.color = "brown";
            this.note_code = "NBA";
            // *** B2 - no notes r added
          } else {
            console.log("B2");
            this.color = "black";
            const calEventDetails = {
              id: this.currentlyEditing,
              color: this.color,
              note_code: this.note_code,
              admin_notes: this.selectedEvent.admin_notes,
            };
            await API.graphql({
              query: updateCalEvent,
              variables: { input: calEventDetails },
            });

            // 1)
            // make sure it is not triggered when assigning a newly created service job
            // make sure there's not a new job alert... does not show up when there's a duplicate

            // 2) when edit without changing anything, it turns blue
          }

          //when changing technician, duplicate service job and delete original

          // copyDelete determines whether to control the alert sound and box
          this.copyDelete = "off";
          this.duplicateEvent(ev);
          this.deleteEvent(ev);

          // this.copyDelete="off"
          // this.selectedEvent.color=this.color
          // this.selectedEvent.name=ev.time_of_day + " - " + ev.owner2 + " - " + ev.service_category + " - " + ev.apt_num + " - " + ev.apt_status + " - " + this.selectedEvent.category
        } // ** B ends here
      } // * ends here

      // ** C did not change technician but notes were added
      else if (
        this.before_details_value != ev.details ||
        this.before_admin_notes_value != ev.admin_notes ||
        this.before_emp_notes_value != ev.emp_notes
      ) {
        // are there note changes
        // without technician
        if (ev.category === null) {
          // *** C1 customer added notes
          if (this.before_details_value != ev.details) {
            console.log("C1");
            this.note_code = "NBC";
          }
          // *** C2 admin added notes
          else if (this.before_admin_notes_value != ev.admin_notes) {
            console.log("C2");
            this.note_code = "NBA";
          }
          // *** C3 tech added notes
          else if (this.before_emp_notes_value != ev.emp_notes) {
            console.log("C3");
            this.note_code = "NBT";
          }
          this.color = "red";
        } else {
          // note changes with technician
          // *** C4 customer added notes
          if (this.before_details_value != ev.details) {
            console.log("C4");
            this.note_code = "NBC";
            this.color = "orange";
          }
          // *** C5 admin added notes
          else if (this.before_admin_notes_value != ev.admin_notes) {
            console.log("C5");
            this.note_code = "NBA";
            this.color = "brown";
          }
          // *** C6 tech added notes
          else if (this.before_emp_notes_value != ev.emp_notes) {
            console.log("C6");
            this.note_code = "NBT";
            this.color = "orange";
          }
        }
      } else {
        // *** C7 Nothing changed
        console.log("C7");
        if (!this.selectedEvent.category) {
          this.color = "red";
        } else {
          this.color = ev.color;
        }

        this.note_code = ev.note_code;
      }
      const calEventDetails = {
        id: this.currentlyEditing,
        color: this.color,
        note_code: this.note_code,
        details: ev.details,
        emp_notes: ev.emp_notes,
        admin_notes: ev.admin_notes,
      };
      await API.graphql({
        query: updateCalEvent,
        variables: { input: calEventDetails },
      });

      // B should end here

      this.selectedOpen = false;
      this.currentlyEditing = null;

      // EH2
      // this.getCalEvents()
    },
    async duplicateEvent(ev) {
      // const calEventDetailsDel = { id: ev.id };
      // await API.graphql({
      //   query: deleteCalEvent,
      //   variables: { input: calEventDetailsDel },
      // });
      // console.log("Delete")

      const calEventDetails = {
        name: "",
        details: ev.details,
        start: ev.start,
        end: ev.end,
        owner2: ev.owner2,
        service_category: ev.service_category,
        apt_num: ev.apt_num,
        apt_status: ev.apt_status,
        time_of_day: ev.time_of_day,
        admin_notes: ev.admin_notes,
        emp_notes: ev.emp_notes,
        category: ev.category,
        color: this.color, // fixes problem for when changing tech n adding notes, stays black
        note_code: this.note_code, // fixex problem for when changing tech n adding notes, tech is
      };
      // await API.graphql({
      //   query: updateCalEvent,
      //   variables: { input: calEventDetails },
      // });
      await API.graphql({
        query: createCalEvent,
        variables: { input: calEventDetails },
      });
      console.log("Copy");
    },
    closeEvent() {
      this.selectedOpen = false;
      this.details = "";
      this.emp_notes = "";
      this.admin_notes = "";
      this.currentlyEditing = null;
    },
    async completeEvent(ev) {
      ev.color = "blue";
      ev.note_code = "COMP";

      const calEventDetails = {
        id: ev.id,
        emp_notes: ev.emp_notes,
        color: ev.color,
        note_code: ev.note_code,
        // name: "COMPLETED " + "- " + ev.name
      };

      await API.graphql({
        query: updateCalEvent,
        variables: { input: calEventDetails },
      });
      this.dialogCompleteConfirmation = false;
      this.selectedOpen = false;
      this.currentlyEditing = null;

      // EH3
      // this.getCalEvents();
    },
    async invoiceEvent(ev) {
      ev.color = "green";
      ev.note_code = "INV";

      const calEventDetails = {
        id: ev.id,
        color: ev.color,
        note_code: ev.note_code,
        // name: "COMPLETED " + "- " + ev.name
      };

      await API.graphql({
        query: updateCalEvent,
        variables: { input: calEventDetails },
      });
      this.dialogInvoiceConfirmation = false;
      this.selectedOpen = false;
      this.currentlyEditing = null;

      // EH3
      // this.getCalEvents();
    },

    async ackEvent(ev) {
      if (ev.category !== null) {
        ev.color = "black";
      } else {
        ev.color = "red";
      }

      if (ev.note_code !== "CANC" || ev.note_code !== "COMP") {
        this.note_code = null;
      }

      const calEventDetails = {
        id: ev.id,
        color: ev.color,
        note_code: this.note_code,
        details: this.selectedEvent.details,
        emp_notes: this.selectedEvent.emp_notes,
        admin_notes: this.selectedEvent.admin_notes,
      };
      await API.graphql({
        query: updateCalEvent,
        variables: { input: calEventDetails },
      });
      this.selectedOpen = false;
      this.currentlyEditing = null;
      // this.getCalEvents();
    },
    async deleteEvent(ev) {
      console.log("Delete Event");
      const calEventDetails = { id: ev.id };
      await API.graphql({
        query: deleteCalEvent,
        variables: { input: calEventDetails },
      });
      this.dialogDeleteConfirmation = false;
      this.selectedOpen = false;

      // this.currentlyEditing = null;
      // this.getCalEvents();
    },
    viewDay({ date }) {
      this.focus = date;
      this.type = "day";
    },
    getEventColor(event) {
      // if(this.categories.indexOf(this.userProps) >= 0 || this.userProps === 'admin'){
      return event.color;
      // } else {
      //   return 'black'
      // }
    },
    getEventName(event) {
      // if(this.categories.indexOf(this.userProps) >= 0 || this.userProps === 'admin'){
      //   return event.color;
      // } else {
      //   return event.color
      // }
      return event.apt_status;
    },
    setToday() {
      this.focus = "";
    },
    prev() {
      this.$refs.calendar.prev();
    },
    next() {
      this.$refs.calendar.next();
    },
    showEvent({ nativeEvent, event }) {
      const open = () => {
        this.selectedEvent = event;
        this.selectedElement = nativeEvent.currentTarget;
        setTimeout(() => (this.selectedOpen = true), 10);
      };

      if (this.selectedOpen) {
        this.selectedOpen = false;
        setTimeout(open, 10);
      } else {
        open();
      }
      nativeEvent.stopPropagation();

      this.before_details_value = this.selectedEvent.details;
      this.before_emp_notes_value = this.selectedEvent.emp_notes;
      this.before_admin_notes_value = this.selectedEvent.admin_notes;
      this.before_category_value = this.selectedEvent.category;
    },
    updateRange({ start, end }) {
      const events = [];

      const min = new Date(`${start.date}T00:00:00`);
      const max = new Date(`${end.date}T23:59:59`);
      const days = (max.getTime() - min.getTime()) / 86400000;
      const eventCount = this.rnd(days, days + 20);

      for (let i = 0; i < eventCount; i++) {
        const allDay = this.rnd(0, 3) === 0;
        const firstTimestamp = this.rnd(min.getTime(), max.getTime());
        const first = new Date(firstTimestamp - (firstTimestamp % 900000));
        const secondTimestamp = this.rnd(2, allDay ? 288 : 8) * 900000;
        const second = new Date(first.getTime() + secondTimestamp);

        events.push({
          name: this.names[this.rnd(0, this.names.length - 1)],
          start: first,
          end: second,
          color: this.colors[this.rnd(0, this.colors.length - 1)],
          timed: !allDay,
        });
      }

      this.events = events;

      this.getCalEvents();
    },
    rnd(a, b) {
      return Math.floor((b - a + 1) * Math.random()) + a;
    },
  },
};
</script>
<style>
.selected {
  background-color: blue;
}
</style>
