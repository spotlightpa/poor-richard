import Vue from "vue";

import { library } from "@fortawesome/fontawesome-svg-core";
import {
  faArrowAltCircleRight,
  faArrowAltCircleLeft,
  faEnvelope
} from "@fortawesome/free-regular-svg-icons";
import { faLock } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/vue-fontawesome";

import DonationForm from "./components/DonationForm.vue";
import { each } from "./dom-utils.js";

library.add(faArrowAltCircleRight, faArrowAltCircleLeft, faEnvelope, faLock);

Vue.component("font-awesome-icon", FontAwesomeIcon);

let currencyFormat = new Intl.NumberFormat("en-US", {
  style: "currency",
  currency: "USD"
});

Vue.filter("formatUSD", amount => currencyFormat.format(amount));

if (!window.ga) {
  window.ga = function() {
    (window.ga.q = window.ga.q || []).push(arguments);
  };
  window.ga.l = +new Date();
}

let GA = {
  install(Vue) {
    Vue.prototype.$ga = (...args) => {
      window.ga(...args);
    };
  }
};

Vue.use(GA);

each("[data-vue=donation-form]", el => {
  let div = document.createElement("div");
  let parent = el.parentNode;
  parent.insertAdjacentElement("afterend", div);
  parent.removeChild(el);
  new Vue(DonationForm).$mount(div);
});
