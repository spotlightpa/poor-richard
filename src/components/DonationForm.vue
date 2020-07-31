<script>
import WindowListener from "./WindowListener.js";
import DonationFormAmount from "./DonationFormAmount.vue";
import DonationFormInfo from "./DonationFormInfo.vue";
import DonationFormPayment from "./DonationFormPayment.vue";

import { DonationFormData } from "../utils/form-data.js";

export default {
  components: {
    WindowListener,
    DonationFormAmount,
    DonationFormInfo,
    DonationFormPayment,
  },
  data() {
    return {
      testing: false,
      stepObj: {
        items: [
          { name: "Amount", component: DonationFormAmount },
          { name: "Information", component: DonationFormInfo },
          { name: "Payment", component: DonationFormPayment },
        ],
        n: 0,
      },
      cnpFormData: DonationFormData(),
    };
  },
  computed: {
    stepComponent() {
      return this.stepObj.items[this.stepObj.n].component;
    },
  },
  mounted() {
    this.testing = !!window.location.search.match(/debug=donate/);
    this.$gae({
      eventLabel: "donate:view",
      nonInteraction: true,
    });
    window.history.replaceState({ step: this.stepObj.n }, "", "");
  },
  methods: {
    changeStep(delta) {
      this.stepObj.n += delta;
      this.$refs.anchor.scrollIntoView({ behavior: "smooth", block: "center" });
      window.history.pushState({ step: this.stepObj.n }, "", "");
      let stepName = this.stepObj.items[this.stepObj.n].name;
      this.$gae({
        eventLabel: `donate:view-step:${stepName}`,
      });
    },
    popstate(ev) {
      let { step } = ev.state;
      if (isFinite(step) && step < this.stepObj.n) {
        this.stepObj.n = step;
      }
    },
  },
};
</script>

<template>
  <div class="form-container">
    <window-listener event="popstate" @popstate="popstate"></window-listener>
    <a ref="anchor"></a>

    <keep-alive>
      <component
        :is="stepComponent"
        :testing="testing"
        :form-data="cnpFormData"
        :step-obj="stepObj"
        @change-step="changeStep"
      ></component>
    </keep-alive>
  </div>
</template>
