<script>
import DonationFormAmount from "./DonationFormAmount.vue";
import DonationFormInfo from "./DonationFormInfo.vue";
import DonationFormPayment from "./DonationFormPayment.vue";
import DonationFormSubmit from "./DonationFormSubmit.vue";

import { DonationFormData } from "../form-data.js";

export default {
  components: {
    DonationFormAmount,
    DonationFormInfo,
    DonationFormSubmit,
    DonationFormPayment
  },
  data() {
    return {
      testing: false,
      stepObj: {
        items: [
          { name: "Amount", component: DonationFormAmount },
          { name: "Information", component: DonationFormInfo },
          { name: "Payment", component: DonationFormPayment },
          { name: "Confirm", component: DonationFormSubmit }
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
  },
  methods: {
    changeStep(inc) {
      this.stepObj.n += inc;
      this.$refs.anchor.scrollIntoView({ behavior: "smooth", block: "center" });
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
