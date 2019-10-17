<script>
import BulmaField from "./BulmaField.vue";
import BulmaFieldInput from "./BulmaFieldInput.vue";
import BulmaMessage from "./BulmaMessage.vue";
import BulmaModal from "./BulmaModal.vue";

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
  components: {
    BulmaField,
    BulmaFieldInput,
    BulmaMessage,
    BulmaModal
  },
  props: {
    formData: Object
  },
  data() {
    return {
      recurringOptions: [
        { text: "Monthly", value: "Month" },
        { text: "Yearly", value: "Year" },
        { text: "One time only", value: "" }
      ],
      otherAmount: null,
      showOtherAmount: false,
      showModal: false,
      showValidationMessage: false,
      isPositiveNumber
    };
  },
  computed: {
    amounts() {
      return amountsObj[this.formData.recurring];
    },
    validationMessage() {
      if (!this.showValidationMessage) {
        return null;
      }
      // Trigger reactive connection to email
      +this.formData.email;
      return this.$refs.email.validationMessage;
    },
    annualizedAmount() {
      return Math.ceil(this.formData.donationAmount / 12);
    }
  },
  watch: {
    otherAmount(newVal) {
      let n = parseFloat(newVal) || 0;
      this.formData.donationAmount = n;
    }
  },
  methods: {
    setDonationAmount(amount) {
      this.formData.donationAmount = amount;
      this.showOtherAmount = false;
    },
    toggleOtherAmount() {
      this.otherAmount = String(this.formData.donationAmount);
      this.formData.donationAmount = null;
      this.showOtherAmount = true;
    },
    setRecurring(value) {
      this.showOtherAmount = false;
      this.formData.recurring = value;
      this.formData.donationAmount = amountsDefaults[value];
    },
    sendFocus(ev) {
      let [label] = ev.target.labels;
      let eventLabel = label ? label.innerText : ev.target.name;
      this.$ga("send", "event", {
        eventCategory: "Donation form",
        eventAction: "Focused a field",
        eventLabel
      });
    },
    validate(ev) {
      let valid = ev.currentTarget.form.reportValidity();
      let eventLabel = valid ? "Valid screen 1" : "Invalid screen 1";
      this.$ga("send", "event", {
        eventCategory: "Donation form",
        eventAction: "Advance from screen 1",
        eventLabel
      });
      if (valid) {
        if (this.formData.recurring) {
          this.nextStep();
        } else {
          this.showModal = true;
        }
      }
    },
    nextStep() {
      this.$emit("change-step", +1);
    },
    noThanks() {
      this.showModal = false;
      this.nextStep();
    },
    switchMonthly() {
      this.showOtherAmount = true;
      this.otherAmount = String(this.annualizedAmount);
      this.formData.recurring = "Month";
      this.showModal = false;
      this.nextStep();
    }
  }
};
</script>

<template>
  <form autocomplete="on" @focus.capture="sendFocus">
    <BulmaField
      v-slot="{ idForLabel }"
      :validation-message="validationMessage"
      control-class="has-icons-left"
    >
      <input
        :id="idForLabel"
        ref="email"
        v-model="formData.email"
        class="input is-large"
        :max-length="50"
        required
        type="email"
        autocomplete="billing email"
        placeholder="mysylvania@example.com"
        @invalid.prevent="showValidationMessage = true"
      />
      <span class="icon is-large is-left has-text-primary">
        <font-awesome-icon :icon="['far', 'envelope']" />
      </span>
    </BulmaField>
    <div class="tabs is-toggle is-large is-fullwidth">
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
    <div class="buttons">
      <button
        v-for="amount of amounts"
        :key="amount"
        class="button is-large is-primary"
        :class="{ 'is-inverted': formData.donationAmount !== amount }"
        type="button"
        @click="setDonationAmount(amount)"
      >
        ${{ amount }}
      </button>
      <button
        class="button is-primary is-large"
        :class="{ 'is-inverted': !showOtherAmount }"
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

    <div class="buttons is-right">
      <button
        type="button"
        class="button is-success is-large"
        @click="validate"
      >
        <span>
          Continue
        </span>
        <span class="icon">
          <font-awesome-icon :icon="['far', 'arrow-alt-circle-right']" />
        </span>
      </button>
    </div>

    <BulmaModal :value="showModal" @input="noThanks">
      <BulmaMessage
        header="Switch to Monthly?"
        :close-button="noThanks"
        class="is-warning is-medium"
      >
        <h1 class="title">
          Would you prefer to donate {{ annualizedAmount | formatUSD }} every
          month?
        </h1>
        <p>
          Donating monthly is the best way to show your support for the on-going
          work of Spotlight PA.
          <br />
          <br />
        </p>
        <div class="buttons">
          <button type="button" class="button is-warning " @click="noThanks">
            No thanks
          </button>
          <button
            type="button"
            class="button is-primary is-focused"
            @click="switchMonthly"
          >
            Yes, switch to monthly
          </button>
        </div>
      </BulmaMessage>
    </BulmaModal>
  </form>
</template>
