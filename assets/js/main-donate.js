import Vue from "vue";
import DonationForm from "./components/DonationForm.vue";
import { each } from "./dom-utils.js";

if (!window.ga) {
  window.ga = function() {
    (window.ga.q = window.ga.q || []).push(arguments);
  };
  window.ga.l = +new Date();
}

let GA = {
  install(Vue) {
    Vue.prototype.$ga = function() {
      window.ga(arguments);
    };
  }
};

Vue.use(GA);

each("[data-vue=donation-form]", el => {
  new Vue(DonationForm).$mount(el);
});
