<script>
import TransitionExpand from "./TransitionExpand.vue";

import DonationFormAmount from "./DonationFormAmount.vue";
import DonationFormInfo from "./DonationFormInfo.vue";
import DonationFormPayment from "./DonationFormPayment.vue";
import DonationFormSubmit from "./DonationFormSubmit.vue";

import { codeUSA } from "../form-data.js";

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
      steps: ["Amount", "Information", "Payment", "Confirm"],
      formStep: 0,
      cnpFormData: {
        donationAmount: 15,
        recurring: "Month",
        firstName: "",
        middleInitial: "",
        lastName: "",
        email: "",
        country: codeUSA,
        address1: "",
        address2: "",
        address3: "",
        city: "",
        stateOrProvince: "",
        postalCode: "",
        phoneNumber: "",
        cardName: "",
        ccNumber: "",
        cvv: "",
        expMonth: "",
        expYear: "",
        donationName: "",
        comments: "",
        wantsNewsletter: true,
        wantsPartners: true
      }
    };
  },
  computed: {},
  mounted() {
    this.$ga("send", "event", {
      eventCategory: "Donation form",
      eventAction: "Saw donation form",
      nonInteraction: true
    });
  },
  methods: {
    changeStep(inc) {
      this.formStep += inc;
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
          :key="step"
          :class="{ 'is-active': i >= formStep }"
        >
          <a
            :class="{ 'has-text-success': i == formStep }"
            @click="formStep = i"
            v-text="step"
          ></a>
        </li>
      </ul>
    </nav>

    <TransitionExpand>
      <keep-alive>
        <DonationFormAmount
          v-if="formStep === 0"
          :form-data="cnpFormData"
          @change-step="changeStep"
        ></DonationFormAmount>
      </keep-alive>
    </TransitionExpand>
    <TransitionExpand>
      <keep-alive>
        <DonationFormInfo
          v-if="formStep === 1"
          :form-data="cnpFormData"
          @change-step="changeStep"
        ></DonationFormInfo>
      </keep-alive>
    </TransitionExpand>

    <TransitionExpand>
      <keep-alive>
        <DonationFormPayment
          v-if="formStep === 2"
          :form-data="cnpFormData"
          @change-step="changeStep"
        ></DonationFormPayment>
      </keep-alive>
    </TransitionExpand>

    <TransitionExpand>
      <keep-alive>
        <DonationFormSubmit
          v-if="formStep === 3"
          v-bind="cnpFormData"
          @change-step="changeStep"
        ></DonationFormSubmit>
      </keep-alive>
    </TransitionExpand>
  </div>
</template>
