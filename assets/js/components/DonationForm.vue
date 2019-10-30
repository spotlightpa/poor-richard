<script>
import DonationFormAmount from "./DonationFormAmount.vue";
import DonationFormInfo from "./DonationFormInfo.vue";
import DonationFormPayment from "./DonationFormPayment.vue";

import { DonationFormData } from "../form-data.js";

export default {
  components: {
    DonationFormAmount,
    DonationFormInfo,
    DonationFormPayment
  },
  data() {
    return {
      testing: false,
      stepObj: {
        items: [
          { name: "Amount", component: DonationFormAmount },
          { name: "Information", component: DonationFormInfo },
          { name: "Payment", component: DonationFormPayment }
        ],
        n: 0
      },
      cnpFormData: DonationFormData()
    };
  },
  computed: {
    stepComponent() {
      return this.stepObj.items[this.stepObj.n].component;
    }
  },
  mounted() {
    this.testing = !!window.location.search.match(/testing/);
    this.$ga("send", "event", {
      eventCategory: "Donation form",
      eventAction: "Saw donation form",
      nonInteraction: true
    });
    window.history.replaceState({ step: this.stepObj.n }, "", "");
    this.statePopper = ev => void this.popstate(ev);
    window.addEventListener("popstate", this.statePopper);
  },
  destroyed() {
    window.removeEventListener("popstate", this.statePopper);
  },
  methods: {
    changeStep(inc) {
      this.stepObj.n += inc;
      window.history.pushState({ step: this.stepObj.n }, "", "");
      this.$refs.anchor.scrollIntoView({ behavior: "smooth", block: "center" });
    },
    popstate(ev) {
      let { step } = ev.state;
      if (isFinite(step) && step < this.stepObj.n) {
        this.stepObj.n = step;
      }
    }
  }
};
</script>

<template>
  <div>
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
