<script>
import DonationFormMixin from "./DonationFormMixin.js";

import { hasValidLuhn } from "../luhn.js";
import { monthOptions } from "../form-data.js";

function ccValidator(val) {
  return hasValidLuhn(val) ? "" : "Please enter a valid credit card number";
}

export default {
  mixins: [DonationFormMixin],
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
      label="Name on card"
      :required="true"
      autocomplete="cc-name"
      placeholder="William Penn"
    ></BulmaFieldInput>
    <div class="columns">
      <div class="column">
        <BulmaFieldInput
          v-model="ccNumber"
          label="Credit card number"
          placeholder="••••••••••••••••"
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
          label="Expiration month"
          name="ExpirationMonth"
          :options="monthOptions"
          required
          autocomplete="cc-exp-month"
        ></BulmaFieldSelect>
      </div>
      <div class="column">
        <BulmaFieldSelect
          v-model="formData.expYear"
          label="Expiration year"
          name="ExpirationYear"
          :options="expirationYears"
          :required="true"
          autocomplete="cc-exp-year"
        ></BulmaFieldSelect>
      </div>
    </div>

    <DonationFormButtons
      @back="stepDec"
      @continue="validate"
    ></DonationFormButtons>
  </form>
</template>
