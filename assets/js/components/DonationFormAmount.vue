<script>
import DonationFormMixin from "./DonationFormMixin.js";

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
      isPositiveNumber
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
    <hgroup class="has-text-centered has-margin-bottom-thick">
      <h1
        class="title is-spaced has-text-black is-uppercase"
        :class="sizeTitle"
      >
        Join Us
      </h1>

      <p class="is-size-3 is-size-4-mobile">
        Support the only investigative newsroom
        <span class="is-hidden-touch"><br /></span>
        dedicated to covering Pennsylvania state government.
      </p>

      <hr
        class="is-emphatic-underline is-margin-centered has-margin-top has-margin-bottom max-12r"
      />

      <p class="is-size-3 is-size-4-mobile">
        <strong
          >For a limited time only, your tax-deductible donation to support
          Spotlight PA can be tripled,</strong
        >
        thanks to NewsMatch and the Wyncote Foundation. Let’s hold the powerful
        to account.
      </p>
    </hgroup>

    <div class="buttons is-centered is-hidden-desktop">
      <button
        v-for="opt of recurringOptions"
        :key="opt.value"
        :class="formData.recurring === opt.value ? 'is-primary' : 'is-light'"
        class="button is-large"
        type="button"
        @click="setRecurring(opt.value)"
        v-text="opt.text"
      ></button>
    </div>

    <div class="tabs is-toggle is-medium is-fullwidth is-hidden-touch">
      <ul>
        <li
          v-for="opt of recurringOptions"
          :key="opt.value"
          :class="{
            'is-active': formData.recurring === opt.value
          }"
        >
          <a @click="setRecurring(opt.value)" v-text="opt.text"></a>
        </li>
      </ul>
    </div>

    <div class="buttons is-centered">
      <button
        v-for="amount of amounts"
        :key="amount"
        class="button is-large"
        :class="
          formData.donationAmount === amount && !showOtherAmount
            ? 'is-primary'
            : 'is-light'
        "
        type="button"
        @click="setDonationAmount(amount)"
      >
        ${{ amount }}{{ perPeriod }}
      </button>
      <button
        class="button is-large"
        :class="showOtherAmount ? 'is-primary' : 'is-light'"
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
        class="button is-fullwidth is-primary has-text-weight-semibold"
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

    <BulmaModal :value="showModal" @input="noThanks">
      <BulmaMessage
        header="Switch to Monthly?"
        :show-close-button="true"
        class="is-primary is-medium"
        @close-button="noThanks"
      >
        <h1 class="title is-size-3">
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
          <button type="button" class="button is-light " @click="noThanks">
            No thanks
          </button>
          <button
            type="button"
            class="button is-primary has-text-weight-bold is-focused"
            @click="switchMonthly"
          >
            Yes, switch to monthly
          </button>
        </div>
      </BulmaMessage>
    </BulmaModal>
  </form>
</template>
