import Vue from "vue";
import DonationForm from "./components/DonationForm.vue";
import { each } from "./dom-utils.js";

each("[data-vue=donation-form]", el => {
  new Vue(DonationForm).$mount(el);
});
