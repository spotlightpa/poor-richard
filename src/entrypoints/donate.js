import Vue from "vue";

import { library } from "@fortawesome/fontawesome-svg-core";
import {
  faArrowAltCircleRight,
  faArrowAltCircleLeft,
  faEnvelope
} from "@fortawesome/free-regular-svg-icons";
import { faLock } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/vue-fontawesome";

import DonationForm from "../components/DonationForm.vue";
import { each } from "../utils/dom-utils.js";
import { sendGAEvent } from "../utils/google-analytics.js";

library.add(faArrowAltCircleRight, faArrowAltCircleLeft, faEnvelope, faLock);

Vue.component("font-awesome-icon", FontAwesomeIcon);

let currencyFormat = new Intl.NumberFormat("en-US", {
  style: "currency",
  currency: "USD"
});

Vue.filter("formatUSD", amount => currencyFormat.format(amount));

let GA = {
  install(Vue) {
    Vue.prototype.$gae = obj => void sendGAEvent(obj);
  }
};

Vue.use(GA);

each("[data-vue=donation-form]", el => {
  new Vue(DonationForm).$mount(el);
});
