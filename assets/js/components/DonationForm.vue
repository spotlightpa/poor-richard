<script>
import TransitionExpand from "./TransitionExpand.vue";

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
    DonationFormPayment,
    TransitionExpand
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
      this.$refs.breadcrumbs.scrollIntoView({ behavior: "smooth" });
    }
  }
};
</script>

<template>
  <div>
    <hgroup class="has-text-centered">
      <h1 class="title is-uppercase is-size-1">Join Us</h1>

      <h2 class="subtitle has-text-grey">
        Become a founding donor to the only investigative newsroom covering
        Pennsylvania’s state government.
      </h2>
      <p>
        Your tax-deductible donation to Spotlight PA will help us investigate
        one of the largest and most opaque state capitals in the U.S.
      </p>

      <p><strong>Together, we can hold the powerful to account.</strong></p>
    </hgroup>

    <nav
      ref="breadcrumbs"
      class="breadcrumb is-centered block is-large has-arrow-separator"
      aria-label="breadcrumbs"
    >
      <ul>
        <li
          v-for="(step, i) of steps"
          :key="step.name"
          :class="{ '-is-active': i >= stepN }"
        >
          <a
            :class="{ 'has-text-success': i == stepN }"
            @click="stepN = i"
            v-text="step.name"
          ></a>
        </li>
      </ul>
    </nav>
    <TransitionExpand>
      <keep-alive>
        <component
          :is="stepComponent"
          :testing="testing"
          :form-data="cnpFormData"
          @change-step="changeStep"
        ></component>
      </keep-alive>
    </TransitionExpand>
  </div>
</template>
