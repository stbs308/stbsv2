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
              <v-list-item @click="type = 'day'"><v-list-item-title>Day</v-list-item-title></v-list-item>
              <v-list-item @click="type = 'week'"><v-list-item-title>Week</v-list-item-title></v-list-item>
              <v-list-item @click="type = 'month'"><v-list-item-title>Month</v-list-item-title></v-list-item>
              <v-list-item @click="type = '4day'"><v-list-item-title>4 days</v-list-item-title></v-list-item>
              <v-list-item @click="setToday"><v-list-item-title>Go to Today</v-list-item-title></v-list-item>
              <v-list-item
                v-if="userProps === 'admin'"
                @click="type = 'category'"
                ><v-list-item-title>Employee</v-list-item-title></v-list-item
              >
              <v-list-item
                @click="dialogFind = true"
                ><v-list-item-title>Search</v-list-item-title></v-list-item
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
            <v-data-table v-if="userProps === 'admin'" :headers="headers" :items="events" item-key="id" :search="search" :sort-by="['owner2','start']" :sort-desc="[false, true]" multi-sort class="elevation-1" :single-expand=true :expanded.sync="expanded" show-expand>
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
            <v-data-table v-else-if="categories.includes(userProps)" :headers="headersTech" :items="events" :search="search" :sort-by="['owner2','start']" :sort-desc="[false, true]" multi-sort class="elevation-1" :single-expand=true :expanded.sync="expanded" show-expand>
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
            <v-data-table v-else-if="!categories.includes(userProps) || userProps !== 'admin'" :headers="headersCust" :items="events" :search="search" :sort-by="['owner2','start']" :sort-desc="[false, true]" multi-sort class="elevation-1" :single-expand=true :expanded.sync="expanded" show-expand>
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
              <v-alert v-if="showError" dense type="error">Required info missed or wrong date chosen *</v-alert>
                <v-text-field
                  @click="resetError"
                  v-model="start_date"
                  type="date"
                  label="Date of Service* (*=required)"
                  :rules="rules"
                ></v-text-field>
                <v-text-field v-model="apt_num" label="Enter Apartment Number* (one per scheduled service)" @click="resetError"></v-text-field>
                <v-row @click="resetError">
                  <v-col cols="12" sm="2" md="2">
                    <v-label>Time*</v-label>
                    <v-radio-group v-model="time_of_day" column>
                      <v-radio label="AM" color="blue" value="AM"></v-radio>
                      <v-radio label="PM" color="blue " value="PM"></v-radio>
                    </v-radio-group>
                  </v-col>
                  <v-col cols="12" sm="4" md="4">
                    <v-label>Type*</v-label>
                    <v-radio-group v-model="apt_status" column>
                      <v-radio label="Occupied" color="blue" value="Occupied"></v-radio>
                      <v-radio label="Vacant" color="blue " value="Vacant"></v-radio>
                    </v-radio-group>
                  </v-col>
                  <v-col cols="12" sm="6" md="6">
                    <v-label>Service Category*</v-label>
                    <v-radio-group v-model="service_category" column>
                      <v-radio label="Carpet Cleaning" color="blue" value="Carpet"></v-radio>
                      <v-radio label="Housekeeping" color="blue " value="Housekeeping"></v-radio>
                      <v-radio label="Paint" color="blue " value="Paint"></v-radio>
                      <v-radio label="Other" color="blue " value="Other"></v-radio>
                    </v-radio-group>
                  </v-col>
                </v-row>
                <v-container fluid>
                  <v-row v-if="userProps === 'admin'" align="center" @click="resetError">
                    <v-col class="d-flex" cols="12" sm="6"><v-select v-model="owner2" :items="owners" label="Customer*" solo></v-select></v-col>
                    <v-col class="d-flex" cols="12" sm="6"><v-select v-model="category" :items="categories" label="Technician*" solo></v-select></v-col>
                  </v-row>
                </v-container>
                <v-text-field
                  v-model="details"
                  type="text"
                  label="Job Detail"
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
      <v-sheet height="600">
        <!-- Calendar -->
        <v-calendar
          ref="calendar"
          v-model="focus"
          color="primary"
          :first-interval="23"
          :interval-minutes="480"
          :interval-height="1"
          :event-margin-bottom="10"
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
        >
          <v-card color="grey lighten-4" flat>
            <v-toolbar :color="selectedEvent.color" dark>
              <v-btn v-if="userProps === 'admin'" @click.prevent="dialogDeleteConfirmation = true" icon><v-icon>mdi-delete</v-icon></v-btn>
              <v-toolbar-title v-html="selectedEvent.name"></v-toolbar-title>
            </v-toolbar>
            
            <v-card-text>
              <!-- View Selected Event -->
              <form v-if="currentlyEditing !== selectedEvent.id">
                <div v-if="userProps === 'admin' || userProps === selectedEvent.owner2">
                  <h3>Customer Notes</h3>
                  {{ selectedEvent.details }}
                </div>
                <p></p>
                <!-- If user is admin show more items to be modified -->
                <div v-if="userProps === 'admin' || categories.includes(userProps)">
                  <h3>Technician Notes</h3>
                  {{ selectedEvent.emp_notes }}
                  <p></p>
                  <h3>Admin Notes</h3>
                  {{ selectedEvent.admin_notes }}
                  <p></p>
                  <div v-if="!categories.includes(userProps)">
                    <h3>Technician</h3>
                    {{ selectedEvent.category }}
                  </div>
                </div>
              </form>
              <!-- Edit Selected Event -->
              <form v-else>
                <div v-if="userProps === selectedEvent.owner2">
                  <h3>Customer Notes</h3>
                  <v-textarea
                    v-model="selectedEvent.details"
                    auto-grow filled outlined
                    label="add note" 
                  ></v-textarea>
                </div>
                <div v-else>
                  <h3>Customer Notes</h3>
                  {{ selectedEvent.details }}</div>
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
                      auto-grow filled outlined
                      label="add note"
                    ></v-textarea>
                  </div>
                  <div v-else>{{ selectedEvent.admin_notes }}</div>
                  <!-- DropDown for list of techs -->
                  <div v-if="userProps === 'admin' && selectedEvent.note_code !== 'COMP'">
                    <h3>Technician</h3>
                    <v-container fluid>
                      <v-col class="d-flex" cols="12" sm="6">
                        <v-select v-model="selectedEvent.category" :items="categories" label="Technician" dense solo></v-select>
                      </v-col>
                    </v-container>
                  </div>
                  <div v-if="selectedEvent.note_code === 'COMP'">{{ selectedEvent.category}}</div>
                </div>
              </form>
            </v-card-text>
            <v-card-actions>
              <v-btn text color="secondary" @click="closeEvent">Close</v-btn>
              <div v-if="selectedEvent.note_code === 'CANC'">

              </div>
              <div v-else-if="currentlyEditing !== selectedEvent.id">
                <v-btn text @click.prevent="editEvent(selectedEvent)" >Edit</v-btn>
              </div>
              <v-btn text v-else @click.prevent="updateEvent(selectedEvent)">Save</v-btn>
              <v-btn text
                v-if="!categories.includes(userProps) && userProps !== 'admin' && selectedEvent.note_code !== 'CANC'"
                @click.prevent="dialogCancelConfirmation = true">Cancel Job</v-btn>
              <v-btn
                text
                v-if="(categories.includes(userProps) && selectedEvent.color === 'orange') || (userProps === 'admin' && selectedEvent.color === 'orange')"
                @click.prevent="ackEvent(selectedEvent)"
                >Acknowledge</v-btn
              >
              <v-spacer></v-spacer>
              <v-btn text v-if="selectedEvent.color === 'black' && categories.includes(userProps)" @click="dialogCompleteConfirmation = true">Completed</v-btn>
            </v-card-actions>
          </v-card>
          <!-- Delete Confirmation -->
          <v-row justify="center">
            <v-dialog v-model="dialogDeleteConfirmation" persistent max-width="290">
              <v-card>
                <v-card-title class="error headline" style="font-weight:bold; color:white;">Confirm Delete</v-card-title>
                <v-card-text>Are you sure you want to delete? This cannot be undone.</v-card-text>
                <v-card-actions>
                  <v-spacer></v-spacer>
                  <v-btn text @click="dialogDeleteConfirmation = false">Close</v-btn>
                  <v-btn color="error" text @click="deleteEvent(selectedEvent)">Confirm Delete</v-btn>
                </v-card-actions>
              </v-card>
            </v-dialog>
          </v-row>
          <!-- Cancel Confirmation -->
          <v-row justify="center">
            <v-dialog v-model="dialogCancelConfirmation" persistent max-width="290">
              <v-card>
                <v-card-title class="black headline" style="font-weight:bold; color:white;">Confirm Cancel</v-card-title>
                <v-card-text>Are you sure you want to cancel? This cannot be undone. You will have to resubmit if you feel you still need it afterwards.</v-card-text>
                <v-card-actions>
                  <v-spacer></v-spacer>
                  <v-btn text @click="dialogCancelConfirmation = false">Close</v-btn>
                  <v-btn color="error" text @click="cancelEvent(selectedEvent)">Confirm Cancel</v-btn>
                </v-card-actions>
              </v-card>
            </v-dialog>
          </v-row>
          <!-- Complete Confirmation -->
          <v-row justify="center">
            <v-dialog v-model="dialogCompleteConfirmation" persistent max-width="290">
              <v-card>
                <v-card-title class="blue headline" style="font-weight:bold; color:white;">Confirm Complete</v-card-title>
                <v-card-text>Are you sure you want to set status to complete? This cannot be undone.</v-card-text>
                <v-card-actions>
                  <v-spacer></v-spacer>
                  <v-btn text @click="dialogCompleteConfirmation = false">Close</v-btn>
                  <v-btn color="blue" text @click="completeEvent(selectedEvent)">Confirm Complete</v-btn>
                </v-card-actions>
              </v-card>
            </v-dialog>
          </v-row>
        </v-menu>
      </v-sheet>
      <!-- Alert if there's new job -->
        <v-dialog v-if="userProps === 'admin'" v-model="newJobAlert" persistent max-width="290">
          <v-card>
            <v-card-title class="red headline" style="font-weight:bold; color:white;">New Jobs Alert!</v-card-title>
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
import { useSound } from '@vueuse/sound'
import buttonSfx from '../assets/audio.mp3'
import { listCalEvents } from "@/graphql/queries";
import { onCreateCalEvent } from "@/graphql/subscriptions"
import { API } from "aws-amplify";
import {
  createCalEvent,
  updateCalEvent,
  deleteCalEvent,
} from "@/graphql/mutations";
export default {
  props: ["userProps"],
  data: () => ({
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
      v => (new Date().setHours(0,0,0,0)) <= (new Date(v.replace(/-/g, '/')).setHours(0,0,0,0)) || 'Date must be today or newer'
    ],
    // corners_complex: ['east', 'west'],
    dialogFind: false,
    dialog_color: null,
    searchApt: null,
    showError: false,
    diffInDays: null,
    service_category: null,
    apt_num: " ",
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
    time_of_days: ["AM","PM"],
    apt_statuss: ["Occupied","Vacant"],
    service_categories: ["Carpet","Housekeeping","Paint","Other"],
    category: null,
    categories: ["cesar","conrrado","david","eduardo","martin","pablo","santiago","sury","yamileth"],
    selectedEmp: [],
    newJobAlert: false,
    owner2: null,
    owners: ["dakota","corners","customer1","customer2"],
    note_code: null,
    search: '',
    headers: [
      { text: 'Date', align: 'start', value: 'start',},
      { text: 'Customer', value: 'owner2' },
      { text: 'Technician', value: 'category' },
      { text: 'Apt No.', value: 'apt_num' },
      { text: 'Time of Day', value: 'time_of_day' },
      { text: 'Service', value: 'service_category' },
      { text: 'Status', value: 'apt_status' },
      { text: '', value: 'data-table-expand' },
    ],
    headersTech: [
      { text: 'Date', align: 'start', value: 'start',},
      { text: 'Customer', value: 'owner2' },
      { text: 'Apt No.', value: 'apt_num' },
      { text: 'Time of Day', value: 'time_of_day' },
      { text: 'Service', value: 'service_category' },
      { text: 'Status', value: 'apt_status' },
      { text: '', value: 'data-table-expand' },
    ],
    headersCust: [
      { text: 'Date', align: 'start', value: 'start',},
      { text: 'Apt No.', value: 'apt_num' },
      { text: 'Time of Day', value: 'time_of_day' },
      { text: 'Service', value: 'service_category' },
      { text: 'Status', value: 'apt_status' },
      { text: '', value: 'data-table-expand' },
    ],
    invalidDate: false,
    today: new Date(),
    dialogDeleteConfirmation: false,
    dialogCancelConfirmation: false,
    dialogCompleteConfirmation: false,
    singleExpand: false,
    expanded:[]
  }),
  mounted() {
    this.$refs.calendar.checkChange();
    this.getCalEvents();
    if (this.categories.indexOf(this.userProps) >= 0){
      this.type='day'
    } 
    //   else if (this.userProps === 'admin'){
    //     this.type='month'
    // } 
  },
  setup() {
    const { play } = useSound(buttonSfx)
    return {
      play
    }
  },
  computed:{
    playSound(){
      return this.play
    }
  },
  created(){
    if (this.userProps === 'admin'){
      this.subscribeCreate()
    }
  },
  methods: {
    subscribeCreate(){
      API.graphql({ query: onCreateCalEvent })
        .subscribe({
          next: (eventData) => {
            let event = eventData.value.data.onCreateCalEvent;
            if (this.events.some(item => item.name === event.name)) return; // remove duplications
            this.events = [...this.events, event]
            this.getCalEvents()
            this.newJobAlert = true;
            this.playSound()
          }
        });
    },
    async getCalEvents() {
      // if user is technician
      if (this.categories.indexOf(this.userProps) >= 0) {
        let filter = {category: {eq: this.userProps}};
        const calendars = await API.graphql({ query: listCalEvents, variables: { filter: filter }});
        const eventsorig = calendars.data.listCalEvents.items;
        let events = []
        // let searchableItems = []
        let ce = eventsorig
        ce.forEach(doc => {
          if (doc.note_code === 'NBA'){
            this.color = 'orange'
            this.name = doc.time_of_day + " - " + doc.owner2 + " - " + doc.name2
          } else if (doc.note_code === 'NBT'){
              this.color = 'brown'
              this.name = doc.time_of_day + " - " + doc.owner2 + " - " + doc.name2
              this.selectedEvent.color = this.color
          } else if (doc.note_code === 'NBC'){
              this.color = 'black'
              this.name = doc.time_of_day + " - " + doc.owner2 + " - " + doc.name2
          } else if (doc.note_code === 'CANC' || doc.note_code === 'COMP'){
              this.name = doc.name
              this.color = doc.color
          } else {
            this.color = doc.color
            this.name = doc.time_of_day + " - " + doc.owner2 + " - " + doc.name2
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
            name2: doc.name2,
            note_code: doc.note_code,
            time_of_day: doc.time_of_day,
            apt_num: doc.apt_num,
            apt_status: doc.apt_status,
            service_category: doc.service_category
          })
        })
        this.events = events.sort((a,b) => a.name.localeCompare(b.name))

      // if user is admin
      } else if (this.userProps === 'admin'){
        const calendars = await API.graphql({ query: listCalEvents });
        // this.events = calendars.data.listCalEvents.items;

        const eventsorig = calendars.data.listCalEvents.items;
        let events = []
        let ce = eventsorig
        ce.forEach(doc => {
          events.push({
            id: doc.id,
            owner2: doc.owner2,
            start: doc.start,
            end: doc.end,
            name: doc.name,
            color: doc.color,
            details: doc.details,
            category: doc.category,
            emp_notes: doc.emp_notes,
            admin_notes: doc.admin_notes,
            name2: doc.name2,
            note_code: doc.note_code,
            time_of_day: doc.time_of_day,
            apt_num: doc.apt_num,
            apt_status: doc.apt_status,
            service_category: doc.service_category
          })
        })
        this.events = events.sort((a,b) => a.name.localeCompare(b.name))

      // if customer
      } else {
        let filter = {owner2: {eq: this.userProps}};
        const calendars = await API.graphql({ query: listCalEvents, variables: { filter: filter }});

        const eventsorig = calendars.data.listCalEvents.items;
        let events = []
        let ce = eventsorig
        ce.forEach(doc => {
          // if cancelled, then display name
          if (doc.note_code === 'CANC'){
            this.name = doc.name
            this.color = 'grey'
          } else if (doc.note_code === 'COMP'){
            this.name = doc.name
            this.color = 'blue'
          // if not cancelled, then show only customer pertinent information
          } else {
            this.name = doc.time_of_day + " - " + doc.name2
            this.color = 'black'
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
            name2: doc.name2,
            note_code: doc.note_code,
            time_of_day: doc.time_of_day,
            apt_num: doc.apt_num,
            apt_status: doc.apt_status,
            service_category: doc.service_category
          })
        })
        this.events = events.sort((a,b) => a.name.localeCompare(b.name))
      }
    },
    async createEvent() {

      // set time based on am/pm
      if (this.time_of_day === 'PM'){
          this.start_time = '12:00'
          this.end_time = '16:00'
      }
      // if technician is assigned, color is black, else red
      if (this.category !== null){
        this.color = 'black'
      } else {
        this.color = 'red'
      }
      // if owner2 is set, service is scheduled by admin... if not schedule by admin owner2 = logged in user
      if (this.owner2 === null){
        this.owner2 = this.userProps
      }

      // // Every new service scheduled will have a note_code of NBC
      // this.note_code = 'NBC'

      // if technician is assigned, attach it to job name, else nothing
      if (this.category !== null){
        this.name = this.time_of_day  + " - " + this.owner2 + " - " + this.service_category + " - " + this.apt_num + " - " + this.apt_status + " - " + this.category;
      } else {
        this.name = this.time_of_day  + " - " + this.owner2 + " - " + this.service_category + " - " + this.apt_num + " - " + this.apt_status;
      }
      this.start = this.start_date
      this.end = this.start_date
      // this.start = this.start_date + " " + this.start_time
      // console.log(this.start)
    //   this.end = new Date(this.start_date + " " + this.end_time)
    //   this.end = new Date(Date.parse(this.start_date + " " + this.end_time))
      // this.end = this.start_date + " " + this.end_time
      // console.log(this.end)
      this.name2 = this.service_category + " - " + this.apt_num + " - " + this.apt_status;
      const { name, name2, details, start, end, time_of_day, color, category, owner2, service_category, apt_num, apt_status, note_code } = this;
      const calendar = { name, name2, details, start, end, time_of_day, color, category, owner2, service_category, apt_num, apt_status, note_code };

      // Make field mandatory 
      // If user is admin and all info are available, then create record
      if (this.userProps === 'admin' && this.apt_num && this.start && this.time_of_day && this.apt_status && this.service_category && (new Date().setHours(0,0,0,0)) <= (new Date(this.start_date.replace(/-/g, '/')).setHours(0,0,0,0)) && this.owner2 && this.category) {
        await API.graphql({query: createCalEvent, variables: { input: calendar }});this.clearRecords()} 
      // Else if not admin and user with customer info, create record
      else if (this.userProps !== 'admin' && this.apt_num && this.start && this.time_of_day && this.apt_status && this.service_category && (new Date().setHours(0,0,0,0)) <= (new Date(this.start_date.replace(/-/g, '/')).setHours(0,0,0,0))){
          await API.graphql({query: createCalEvent, variables: { input: calendar }});this.clearRecords()}
      else { 
        this.showError = true
        this.dialog_color = 'red lighten-5'
      }
      this.getCalEvents()

    },
    resetError(){
      this.showError = false
      this.dialog_color = null
    },
    clearRecords(){
      this.dialog=false
      this.showError=false
      this.name = null
      this.name2 = null
      this.owner2 = null
      this.details = null
      this.start = null
      this.time_of_day = null
      this.admin_notes = null
      this.emp_notes = null
      this.category = null
      this.apt_num = " "
      this.apt_status = null
      this.service_category = null
      this.selectedEvent = {}
      this.start_date = null
    },
    editEvent(ev) {
      this.currentlyEditing = ev.id;
    },
    async updateEvent(ev) {

      // If job is not complete, allow for note_code and color changes to tke place
      if (this.selectedEvent.note_code !== 'COMP'){
        // If nothing has changed, close the form
        if (
          this.before_details_value === this.selectedEvent.details &&
          this.before_emp_notes_value === this.selectedEvent.emp_notes &&
          this.before_admin_notes_value === this.selectedEvent.admin_notes &&
          this.before_category_value === this.selectedEvent.category
          ) 
          { 
            this.selectedOpen = false
          } else {
            // Color Determination
            
            // 1 If any note changes, color is orange
            if (
              this.before_details_value != this.selectedEvent.details ||
              this.before_emp_notes_value != this.selectedEvent.emp_notes ||
              this.before_admin_notes_value != this.selectedEvent.admin_notes
              ) { this.color = "orange"; console.log("Rule 1")} 
            // 2 If no technician assigned and color is not grey, color is red
            if (this.selectedEvent.category === null && this.selectedEvent.color !== 'grey'){this.color = 'red'; console.log("Rule 2")}
            // 3A If technician is assigned for first time, color is black
            if (this.before_category_value != this.selectedEvent.category && this.before_category_value === null && this.selectedEvent.note_code === 'NBA'){this.color = 'brown'
              // console.log("Rule 3A")
            // 3B else if technician is assigned for first time, color is black
            } else if (this.before_category_value != this.selectedEvent.category && this.before_category_value === null){this.color = 'black'
            // console.log("Rule 3B")
            }
            // 4 If color is already grey, color stays grey all the way
            if (this.selectedEvent.color === 'grey'){ this.color = 'grey'; console.log("Rule 4")}
            // 5 If technician assignement is changed, append the new tech name to the job name
            // console.log("selectedEvent.name = " + this.selectedEvent.name)
            // console.log("selectedEvent.name2 = " + this.selectedEvent.name2 )
            // console.log("selectedEvent.category = " + this.selectedEvent.category)
            if (this.before_category_value != this.selectedEvent.category){ this.selectedEvent.name= this.selectedEvent.time_of_day + " - " + this.selectedEvent.owner2 + " - " + this.selectedEvent.name2 + " - " + this.selectedEvent.category; console.log("Rule 5") }
              else { this.name=this.selectedEvent.name }
            // 6 If technician assignment is changed and admin notes changed, append the new tech name to the job name and change color to orange
            // console.log("selectedEvent.name = " + this.selectedEvent.name)
            // console.log("before_admin_notes = " + this.before_admin_notes_value)
            // console.log("selectedEvent.admin_notes = " + this.selectedEvent.admin_notes)
            if (this.before_category_value != this.selectedEvent.category && this.before_admin_notes_value != this.selectedEvent.admin_notes)
              { 
                this.name=this.selectedEvent.time_of_day + " - " + this.selectedEvent.owner2 + " - " + this.selectedEvent.name2 + " - " + this.selectedEvent.category 
                this.color = 'orange'; console.log("Rule 6") }
              else { this.name=this.selectedEvent.name }
            // Determine NOTE_CODE and color for admin
            // 7 if customer edit notes, note_code is NBC
            if(this.before_details_value !== this.selectedEvent.details) {
              this.note_code = "NBC"
            // 8 If tech edit notes, note_code is NBT
            } else if (this.before_emp_notes_value !== this.selectedEvent.emp_notes){
              this.note_code = "NBT"
              this.color = 'orange'
              // console.log("Rule 8: " + this.selectedEvent.name)
            // 9 If admin edit notes, note_code is NBA and color is red if no tech has been assigned
            } else if (this.before_admin_notes_value !== this.selectedEvent.admin_notes && this.selectedEvent.category === null){
              this.note_code = "NBA"
              this.color = 'red'
              // console.log("Rule 9")
              // 10 if tech has been assigned for first time and admin make some note changes, make color brown
            } else if (this.before_admin_notes_value !== this.selectedEvent.admin_notes && this.selectedEvent.category !== null){
              this.note_code = 'NBA'
              this.color = 'brown'
              // console.log("Rule 10")
              // 11 if job is red (new) and note_code is NBC and tech is assigned for first time, color should b orange
            } else if (this.selectedEvent.note_code === 'NBC' && this.selectedEvent.color === 'red' && this.before_category_value === null) {
              this.color = 'orange'
              // console.log("Rule 11")
            }

            // Determine what name to show (with or without technician)
            if (this.selectedEvent.category === null){
              this.name=this.selectedEvent.time_of_day + " - " + this.selectedEvent.owner2 + " - " + this.selectedEvent.name2 
              // console.log("Rule 12A")
            } else {
              this.name=this.selectedEvent.time_of_day + " - " + this.selectedEvent.owner2 + " - " + this.selectedEvent.name2 + " - " + this.selectedEvent.category
              // console.log("Rule 12B")
            }

            // if something ended up without any values, use what's already in the db
            if (this.note_code === null){
              this.note_code = this.selectedEvent.note_code
            }

            const calEventDetails = {
              id: this.currentlyEditing,
              name: this.name,
              details: ev.details,
              admin_notes: ev.admin_notes,
              emp_notes: ev.emp_notes,
              category: ev.category,
              color: this.color,
              note_code: this.note_code
            };
            await API.graphql({
              query: updateCalEvent,
              variables: { input: calEventDetails },
            });
            this.selectedOpen = false;
            this.currentlyEditing = null;

            // maintaining colors for admin
            if (this.userProps === 'admin'){
              this.selectedEvent.name = this.name
              this.selectedEvent.color = this.color
            }

            this.getCalEvents();
          }
      // even if job is completed, everyone is allowed to make note changes but not note_code and color changes
      } else if (this.selectedEvent.note_code === 'COMP'){
              const calEventDetails = {
              id: this.currentlyEditing,
              details: ev.details,
              admin_notes: ev.admin_notes,
              emp_notes: ev.emp_notes,
            };
            await API.graphql({
              query: updateCalEvent,
              variables: { input: calEventDetails },
            });
            this.selectedOpen = false;
            this.currentlyEditing = null;
            // this.selectedEvent.name = this.name
            // this.selectedEvent.color = this.color
            this.getCalEvents();

      }
    },
    closeEvent(){
      this.selectedOpen = false
      this.details = ""
      this.emp_notes = ""
      this.admin_notes = ""
      this.currentlyEditing = null

    },
    async cancelEvent(ev) {
      ev.color = "grey";
      ev.category = null;
      ev.note_code = "CANC"

      const calEventDetails = {
        id: ev.id,
        color: ev.color,
        category: ev.category,
        note_code: ev.note_code,
        name: "CANCELLED " + "- " + ev.name
      };

      await API.graphql({
        query: updateCalEvent,
        variables: { input: calEventDetails },
      });

      this.selectedOpen = false;
      this.dialogCancelConfirmation = false;
      this.currentlyEditing = null;
      this.getCalEvents();
    },
    async completeEvent(ev) {
      ev.color = "blue";
      ev.note_code = "COMP"

      const calEventDetails = {
        id: ev.id,
        color: ev.color,
        note_code: ev.note_code,
        name: "COMPLETED " + "- " + ev.name
      };

      await API.graphql({
        query: updateCalEvent,
        variables: { input: calEventDetails },
      });
      this.dialogCompleteConfirmation = false;
      this.selectedOpen = false;
      this.currentlyEditing = null;
      this.getCalEvents();
    },
    async ackEvent(ev) {
      if (ev.category !== null) {
        ev.color = "black";
      } else {
        ev.color = "red";
      }
      
      if (ev.note_code !== 'CANC' || ev.note_code !== 'COMP'){
        this.note_code = null
      }
      
      const calEventDetails = { id: ev.id, color: ev.color, note_code: this.note_code, details: this.selectedEvent.details, emp_notes: this.selectedEvent.emp_notes, admin_notes: this.selectedEvent.admin_notes };
      await API.graphql({
        query: updateCalEvent,
        variables: { input: calEventDetails },
      });
      this.selectedOpen = false;
      this.currentlyEditing = null;
      this.getCalEvents();
    },
    async deleteEvent(ev) {
      const calEventDetails = { id: ev.id };
      await API.graphql({
        query: deleteCalEvent,
        variables: { input: calEventDetails },
      });
      this.dialogDeleteConfirmation = false;
      this.selectedOpen = false;
      this.currentlyEditing = null;
      this.getCalEvents();
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
        this.selectedElement = nativeEvent.target;
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
      this.before_color_value = this.selectedEvent.color


    },
    // showEventTable({ row }) {
       
    //   this.events.map((item, index) => {
    //     item.selected = item === row

    //     this.$set(this.events, index, item)
    // })


    //   const open = () => {
    //     this.selectedEvent = event;
    //     setTimeout(() => (this.selectedOpen = true), 10);
    //   };

    //   if (this.selectedOpen) {
    //     this.selectedOpen = false;
    //     setTimeout(open, 10);
    //   } else {
    //     open();
    //   }

    //   this.before_details_value = this.selectedEvent.details;
    //   this.before_emp_notes_value = this.selectedEvent.emp_notes;
    //   this.before_admin_notes_value = this.selectedEvent.admin_notes;
    //   this.before_category_value = this.selectedEvent.category;
    //   this.before_color_value = this.selectedEvent.color


    // },
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
//     handleClick(row) {
//       this.selectedOpen = true
//     // set active row and deselect others
//     this.events.map((item, index) => {
//         item.selected = item === row

//         this.$set(this.events, index, item)
//     })

//     // or just do something with your current clicked row item data
//     this.selectedEvent.id = row.id
//     this.selectedEvent.owner2 = row.owner2
//     this.selectedEvent.details = row.details

//     console.log(row.owner2)
// },
  //   compareDateRules(){
  //     return [
  //     v => !!v || 'Date is required',
  //     v => new Date().setHours(0,0,0,0) > new Date(v.replace) || 'Date must be today or newer'
  //   ]

  //   },
  //   getFormattedDate(date) {
  //     this.today = this.getFormattedDate(this.today)
  //     let year = date.getFullYear();
  //     let month = (1 + date.getMonth()).toString().padStart(2, '0');
  //     let day = date.getDate().toString().padStart(2, '0');
  
  //     return month + '/' + day + '/' + year;
  //   }
  },
};
</script>
<style>
.selected {
    background-color: blue
}
</style>