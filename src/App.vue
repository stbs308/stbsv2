<template>
  <v-app>
    <v-app-bar app color="primary" dark absolute>
      <span class="mx-auto font-weight-bold white--text">Simply the Best Services, LLC.</span>
      <v-spacer></v-spacer>
      For emergencies, call 214-791-3263
    </v-app-bar>


    <v-main>
      <!-- <TD /> -->
      <Calendar v-if="authState === 'signedin' && user" :userProps="user.username" />
    </v-main>


        <amplify-authenticator>
          <amplify-sign-in slot="sign-in">
            <!-- <amplify-sign-in slot="sign-in" :hide-sign-up="true"> -->
          </amplify-sign-in>
        </amplify-authenticator>
        <amplify-sign-out v-if="authState === 'signedin'" >
        </amplify-sign-out>


  </v-app>
</template>

<script>
import Calendar from './components/Calendar';
// import TD from './components/TechnicalDifficulites.vue'
import { onAuthUIStateChange } from '@aws-amplify/ui-components'

export default {
  name: 'App',
  components: {
    Calendar,
    // TD,
  },
  created() {
    this.unsubscribeAuth = onAuthUIStateChange((authState, authData) => {
      this.authState = authState;
      this.user = authData;
    })
  },
  data() {
    return {
      user: undefined,
      authState: undefined,
      unsubscribeAuth: undefined,
      collapseOnScroll: true,
    }
  },
  beforeDestroy() {
    this.unsubscribeAuth();
  },
  methods:{
    async createRec(){
      console.log("here")
      let record = ["agapito","cesar","conrrado","eduardo","hugo","jose","karen","leo","maria","martin","pablo","resurface","vero","victor","technician1","technician2"]
      record.forEach((item) => {
        console.log(item)
        const inputDetails = {
            username: item,
            category: "T",
            assigned: 1,
          };
          API.graphql({ query: createCustomerTech, variables: { input: inputDetails } });
      })
    }

  }
};
</script>
<style>
  :root {
    --amplify-primary-color: rgba(19, 89, 194, 0.776);
  }
</style>