<script>
import { hasValidLuhn } from "../luhn.js";
import { monthOptions } from "../form-data.js";

import BulmaFieldInput from "./BulmaFieldInput.vue";
import BulmaFieldSelect from "./BulmaFieldSelect.vue";

function ccValidator(val) {
  return hasValidLuhn(val) ? "" : "Please enter a valid credit card number";
}

export default {
  components: {
    BulmaFieldInput,
    BulmaFieldSelect
  },
  props: {
    formData: Object
  },
  data() {
    return {
      hasSetCardName: false,
      cardName_: "",
      ccNumber: "",
      ccValidator,
      monthOptions
    };
  },
  computed: {
    expirationYears() {
      let years = [];
      let thisYear = new Date().getFullYear();
      for (let year = thisYear; year < thisYear + 20; year++) {
        let text = String(year);
        let value = text.slice(2);
        years.push({
          value,
          text
        });
      }
      return years;
    },
    timePeriod() {
      return {
        Month: "monthly",
        Year: "annually",
        "": ""
      }[this.formData.recurring];
    },
    cardName: {
      get() {
        if (!this.hasSetCardName) {
          let name = this.formData.firstName + " " + this.formData.lastName;
          return name.trim();
        }
        return this.cardName_;
      },
      set(val) {
        this.hasSetCardName = true;
        this.cardName_ = val;
      }
    }
  },
  watch: {
    cardName(val) {
      this.formData.cardName = val;
    },
    ccNumber(val) {
      this.formData.ccNumber = val.replace(/\D/g, "");
    }
  },
  methods: {
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
      let eventLabel = valid ? "Valid screen 3" : "Invalid screen 3";
      this.$ga("send", "event", {
        eventCategory: "Donation form",
        eventAction: "Advance from screen 3",
        eventLabel
      });
      if (valid) {
        this.nextStep();
      }
    },
    nextStep() {
      this.$emit("change-step", +1);
    },
    lastStep() {
      this.$emit("change-step", -1);
    },
    setDonationName(val) {
      this.hasSetDonationName = true;
      this.formData.donationName = val;
    }
  }
};
</script>

<template>
  <form autocomplete="on" @focus.capture="sendFocus">
    <h2 class="title has-text-centered">
      Donate {{ formData.donationAmount | formatUSD }} {{ timePeriod }}
    </h2>

    <h2 class="title">Payment Details</h2>
    <BulmaFieldInput
      v-model="cardName"
      label="Name on Card"
      :required="true"
      autocomplete="cc-name"
      placeholder="William Penn"
    ></BulmaFieldInput>
    <div class="columns">
      <div class="column">
        <BulmaFieldInput
          v-model="ccNumber"
          label="Credit Card Number"
          :min-length="15"
          :max-length="17"
          :required="true"
          :validator="ccValidator"
          autocomplete="cc-number"
        ></BulmaFieldInput>
      </div>
      <div class="column">
        <!-- Must use v-model with min-length or invalidation will erase partial input -->
        <BulmaFieldInput
          v-model="formData.cvv"
          label="CVV"
          name="Cvv2"
          :min-length="3"
          :max-length="4"
          :required="true"
          help="CVV is the 3 or 4 digit card verification number on the back of many credit cards"
          autocomplete="cc-csc"
          placeholder="123"
        ></BulmaFieldInput>
      </div>
    </div>
    <div class="columns">
      <div class="column">
        <BulmaFieldSelect
          v-model="formData.expMonth"
          label="Expiration Month"
          name="ExpirationMonth"
          :options="monthOptions"
          required
          autocomplete="cc-exp-month"
        ></BulmaFieldSelect>
      </div>
      <div class="column">
        <BulmaFieldSelect
          v-model="formData.expYear"
          label="Expiration Year"
          name="ExpirationYear"
          :options="expirationYears"
          :required="true"
          autocomplete="cc-exp-year"
        ></BulmaFieldSelect>
      </div>
    </div>

    <div class="buttons is-right">
      <button
        type="button"
        class="button is-warning is-large"
        @click="lastStep"
      >
        <span class="icon">
          <font-awesome-icon :icon="['far', 'arrow-alt-circle-left']" />
        </span>
        <span>
          Back
        </span>
      </button>
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
  </form>
</template>
