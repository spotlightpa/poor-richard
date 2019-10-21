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
      steps: [
        { name: "Amount", component: DonationFormAmount },
        { name: "Information", component: DonationFormInfo },
        { name: "Payment", component: DonationFormPayment },
        { name: "Confirm", component: DonationFormSubmit }
      ],
      stepN: 0,
      cnpFormData: DonationFormData()
    };
  },
  computed: {
    stepComponent() {
      return this.steps[this.stepN].component;
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
      this.stepN += inc;
      this.$refs.anchor.scrollIntoView({ behavior: "smooth", block: "center" });
    }
  }
};
</script>

<template>
  <div>
    <a ref="anchor"></a>
    <nav
      v-if="stepN"
      class="breadcrumb is-centered is-large has-arrow-separator has-margin-bottom"
      aria-label="breadcrumbs"
    >
      <ul>
        <li
          v-for="(step, i) of steps"
          :key="step.name"
          :class="{ 'is-active': i >= stepN && !testing }"
        >
          <a
            :class="{ 'has-text-success': i == stepN }"
            @click="stepN = i"
            v-text="step.name"
          ></a>
        </li>
      </ul>
    </nav>

    <keep-alive>
      <component
        :is="stepComponent"
        :testing="testing"
        :form-data="cnpFormData"
        @change-step="changeStep"
      ></component>
    </keep-alive>
  </div>
</template>
