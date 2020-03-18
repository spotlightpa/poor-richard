<script>
import DonationFormMixin from "./DonationFormMixin.js";

// CnP down from Sunday, March 15th, 2020 from 3:00 - 6:00 AM ET
let showDowntime = false;
{
  const downtimeStart = new Date("2020-03-15T02:00:00-05:00");
  const downtimeStop = new Date("2020-03-15T07:00:00-05:00");
  const now = new Date();
  if (downtimeStart < now && now < downtimeStop) {
    showDowntime = true;
  }
}

let amountsObj = {
  "": [25, 50, 100, 500, 1000],
  Month: [10, 15, 25],
  Year: [50, 100, 500]
};

let amountsDefaults = {
  "": 100,
  Month: 10,
  Year: 100
};

function isPositiveNumber(val) {
  let n = parseFloat(val);
  if (isNaN(n) || n <= 0) {
    return "Amount must be a positive number";
  }
  return "";
}

export default {
  mixins: [DonationFormMixin],
  data() {
    return {
      sizeButton: "is-large",
      sizeTitle: "is-size-0",
      recurringOptions: [
        { text: "Monthly", value: "Month" },
        { text: "Yearly", value: "Year" },
        { text: "One time only", value: "" }
      ],
      otherAmount: null,
      showOtherAmount: false,
      showModal: false,
      isPositiveNumber,
      showDowntime
    };
  },
  computed: {
    amounts() {
      return amountsObj[this.formData.recurring];
    },
    annualizedAmount() {
      return Math.ceil(this.formData.donationAmount / 12);
    },
    perPeriod() {
      return {
        "": "",
        Month: "/mo.",
        Year: "/yr."
      }[this.formData.recurring];
    }
  },
  watch: {
    otherAmount(newVal) {
      let n = parseFloat(newVal) || 0;
      this.formData.donationAmount = n;
    }
  },
  mounted() {
    // Sub-mobile responsive changes
    if (window.innerWidth < 360) {
      this.sizeTitle = "is-size-1";
      this.sizeButton = "";
    } else if (window.innerWidth < 413) {
      this.sizeButton = "is-medium";
    }
  },
  methods: {
    setDonationAmount(amount) {
      this.formData.donationAmount = amount;
      this.showOtherAmount = false;
    },
    toggleOtherAmount() {
      this.showOtherAmount = !this.showOtherAmount;
      if (this.showOtherAmount) {
        this.otherAmount = String(this.formData.donationAmount);
      } else {
        let rec = this.formData.recurring;
        this.formData.donationAmount = amountsDefaults[rec];
      }
    },
    setRecurring(value) {
      this.showOtherAmount = false;
      this.formData.recurring = value;
      this.formData.donationAmount = amountsDefaults[value];
    },
    validStepInc() {
      if (this.formData.recurring) {
        this.stepInc();
      } else {
        this.showModal = true;
        this.$gae({
          eventCategory: "Donation form",
          eventAction: "Saw recurring donation nag screen"
        });
      }
    },
    noThanks() {
      this.showModal = false;
      this.$gae({
        eventCategory: "Donation form",
        eventAction: "Declined recurring donation nag screen"
      });
      this.stepInc();
    },
    switchMonthly() {
      this.showOtherAmount = true;
      this.otherAmount = String(this.annualizedAmount);
      this.formData.recurring = "Month";
      this.showModal = false;
      this.$gae({
        eventCategory: "Donation form",
        eventAction: "Accepted recurring donation nag screen"
      });
      this.stepInc();
    }
  }
};
</script>

<template>
  <form autocomplete="on" @focus.capture="sendFocus">
    <div v-if="showDowntime" class="message is-danger">
      <div class="message-body">
        <h1 class="title">Warning: Planned system maintenance</h1>
        <p>
          Due to planned system maintenance, we will not be able to receive
          donations
          <strong>Sunday, March 15th, 2020 from 3:00 - 6:00 AM ET</strong>.
          Please wait until after this planned maintenance period to make your
          donation. Thank you for your patience and your support of Spotlight
          PA.
        </p>
      </div>
    </div>
    <hgroup class="has-text-centered has-margin-bottom-thick">
      <h1
        class="title is-spaced has-text-black is-uppercase"
        :class="sizeTitle"
      >
        Join Us
      </h1>

      <p class="is-size-3 is-size-4-mobile">
        We provide essential, public-service journalism
        <span class="is-hidden-touch"><br /></span>
        at no cost thanks to readers like you.
      </p>

      <hr
        class="is-emphatic-underline is-margin-centered has-margin-top has-margin-bottom max-12r"
      />

      <p class="is-size-3 is-size-4-mobile">
        Help us continue to aggressively cover Pennsylvania’s response to the
        coronavirus and how it’s affecting communities across the state.
      </p>
    </hgroup>

    <div class="buttons is-centered">
      <button
        v-for="opt of recurringOptions"
        :key="opt.value"
        :class="formData.recurring === opt.value ? 'is-danger' : 'is-light'"
        class="button is-large"
        type="button"
        @click="setRecurring(opt.value)"
        v-text="opt.text"
      ></button>
    </div>

    <div class="buttons is-centered">
      <button
        v-for="amount of amounts"
        :key="amount"
        class="button is-large"
        :class="
          formData.donationAmount === amount && !showOtherAmount
            ? 'is-danger'
            : 'is-light'
        "
        type="button"
        @click="setDonationAmount(amount)"
      >
        ${{ amount }}{{ perPeriod }}
      </button>
      <button
        class="button is-large"
        :class="showOtherAmount ? 'is-danger' : 'is-light'"
        type="button"
        @click="toggleOtherAmount"
      >
        Other
      </button>
    </div>
    <BulmaFieldInput
      v-if="showOtherAmount"
      v-model="otherAmount"
      label="Other Amount"
      :validator="isPositiveNumber"
      :autofocus="true"
      :required="true"
    ></BulmaFieldInput>

    <div class="buttons has-margin-top-thick">
      <button
        type="button"
        class="button is-fullwidth is-danger has-text-weight-semibold"
        :class="sizeButton"
        @click="validate"
      >
        <span>
          Yes, accountability matters
        </span>
        <span class="icon">
          <font-awesome-icon :icon="['far', 'arrow-alt-circle-right']" />
        </span>
      </button>
    </div>

    <p>
      If you prefer to donate by check or are interested in learning about other
      ways to support Spotlight PA, please contact
      <a href="mailto:joanna@spotlightpa.org">joanna@spotlightpa.org</a>.
    </p>
    <p>
      All donations are made to the
      <a href="https://www.lenfestinstitute.org/"
        >Lenfest Institute for Journalism</a
      >, a nonprofit tax-exempt organization under Section 501(c)(3) of the
      Internal Revenue Code, and directed to Spotlight PA’s important
      investigative work.
    </p>

    <BulmaModal :value="showModal" @input="noThanks">
      <BulmaMessage
        header="Switch to Monthly?"
        :show-close-button="true"
        class="is-danger is-medium"
        @close-button="noThanks"
      >
        <h1 class="title is-size-3 has-text-danger">
          Would you prefer to donate {{ annualizedAmount | formatUSD }} every
          month?
        </h1>
        <p>
          Donating monthly is the best way to show your support for the ongoing
          work of Spotlight PA.
          <br />
          <br />
        </p>
        <div class="buttons">
          <button
            type="button"
            class="button is-warning has-text-weight-semibold"
            @click="noThanks"
          >
            No thanks
          </button>
          <button
            type="button"
            class="button is-danger has-text-weight-semibold is-focused"
            @click="switchMonthly"
          >
            Yes, switch to monthly
          </button>
        </div>
      </BulmaMessage>
    </BulmaModal>
  </form>
</template>
