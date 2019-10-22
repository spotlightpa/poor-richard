import Vue from "vue";

import { library } from "@fortawesome/fontawesome-svg-core";
import { faLock } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/vue-fontawesome";

import DonationForm from "./components/DonationForm.vue";
import { each } from "./dom-utils.js";

library.add(faLock);

Vue.component("font-awesome-icon", FontAwesomeIcon);

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
  new Vue(DonationForm).$mount(el);
});
