import Vue from "vue";

import defineCustomElement from "../utils/define-custom-element.js";

import { library } from "@fortawesome/fontawesome-svg-core";
import {
  faArrowAltCircleRight,
  faArrowAltCircleLeft,
  faEnvelope,
} from "@fortawesome/free-regular-svg-icons";
import { faLock } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/vue-fontawesome";

import DonationForm from "../components/DonationForm.vue";
import { sendGAEvent } from "../utils/google-analytics.js";

library.add(faArrowAltCircleRight, faArrowAltCircleLeft, faEnvelope, faLock);

Vue.component("font-awesome-icon", FontAwesomeIcon);

let GA = {
  install(Vue) {
    Vue.prototype.$gae = (obj) =>
      void sendGAEvent({
        eventLabel: "donate:page",
        eventCategory: "donate-form",
        ...obj,
      });
  },
};

Vue.use(GA);

defineCustomElement({ tagName: "donation-form", component: DonationForm });
