<script>
import { codeUSA, countryOptions, stateOptions } from "../form-data.js";

import DonationFormMixin from "./DonationFormMixin.js";

export default {
  mixins: [DonationFormMixin],
  data() {
    return {
      state: "Pennsylvania",
      province: "",
      countryOptions,
      stateOptions,
      hasSetDonationName: false,
      donationName_: ""
    };
  },
  computed: {
    isUSA() {
      return this.formData.country === codeUSA;
    },
    zipOrPostalCode() {
      return this.isUSA ? "Zipcode" : "Postal Code";
    },
    donationName: {
      get() {
        if (!this.hasSetDonationName) {
          let name = this.formData.firstName + " " + this.formData.lastName;
          return name.trim();
        }
        return this.donationName_;
      },
      set(val) {
        this.hasSetDonationName = true;
        this.donationName_ = val;
      }
    }
  },
  watch: {
    donationName(val) {
      this.formData.donationName = val;
    }
  },
};
</script>

<template>
  <form autocomplete="on" @focus.capture="sendFocus">
    <h2 class="title has-text-centered">
      Donate {{ formData.donationAmount | formatUSD }} {{ timePeriod }}
    </h2>
    <h2 class="title">Address</h2>
    <div class="columns">
      <div class="column">
        <BulmaFieldInput
          v-model="formData.firstName"
          label="First Name"
          :max-length="50"
          :required="true"
          autocomplete="billing given-name"
          placeholder="William"
        ></BulmaFieldInput>
      </div>
      <div class="column">
        <BulmaFieldInput
          v-model="formData.lastName"
          label="Last Name"
          :max-length="50"
          :required="true"
          autocomplete="billing family-name"
          placeholder="Penn"
        ></BulmaFieldInput>
      </div>
    </div>
    <BulmaFieldSelect
      v-model="formData.country"
      label="Country"
      :options="countryOptions"
      :required="true"
      autocomplete="billing country"
    ></BulmaFieldSelect>
    <BulmaFieldInput
      v-model="formData.address1"
      label="Address"
      :max-length="100"
      :required="true"
      autocomplete="billing address-line1"
      placeholder="123 Main St."
    ></BulmaFieldInput>
    <BulmaFieldInput
      v-if="formData.address1"
      v-model="formData.address2"
      :max-length="100"
      autocomplete="billing address-line2"
      placeholder="Apt. 2B"
    ></BulmaFieldInput>
    <BulmaFieldInput
      v-if="formData.address2"
      v-model="formData.address3"
      :max-length="100"
      autocomplete="billing address-line3"
    ></BulmaFieldInput>

    <div class="columns">
      <div class="column">
        <BulmaFieldInput
          v-model="formData.city"
          label="City"
          :max-length="50"
          :required="true"
          autocomplete="billing address-level1"
          placeholder="Harrisburg"
        ></BulmaFieldInput>
      </div>
      <div class="column">
        <BulmaFieldSelect
          v-if="isUSA"
          v-model="state"
          label="State"
          :options="stateOptions"
          :required="true"
          autocomplete="billing address-level2"
        ></BulmaFieldSelect>
        <BulmaFieldInput
          v-else
          v-model="province"
          label="Province or Region"
          :max-length="50"
          :required="true"
          autocomplete="billing address-level2"
        ></BulmaFieldInput>
      </div>
    </div>
    <div class="columns">
      <div class="column">
        <BulmaFieldInput
          v-model="formData.postalCode"
          :label="zipOrPostalCode"
          placeholder="17120"
          :max-length="20"
          :required="true"
          autocomplete="billing postal-code"
        ></BulmaFieldInput>
      </div>
      <div class="column">
        <BulmaFieldInput
          v-model="formData.phoneNumber"
          label="Phone number"
          type="tel"
          :required="true"
          autocomplete="billing tel-national"
          placeholder="717-555-1234"
        ></BulmaFieldInput>
      </div>
    </div>

    <h2 class="title">Additional Information</h2>

    <BulmaFieldInput
      v-model="donationName"
      label='How would you like your name to appear in the "Founding Donors" section of our website?'
      label-class=""
      help="To ensure full transparency, we cannot accept anonymous donations."
      placeholder="William Penn"
      autocomplete="name"
      :required="true"
      :max-length="500"
    ></BulmaFieldInput>

    <BulmaField v-slot="{ idForLabel }" label="I am donating because…">
      <textarea
        :id="idForLabel"
        class="textarea"
        rows="3"
        placeholder="Optional: Tell us why you are interested in becoming a Spotlight PA donor."
      ></textarea>
    </BulmaField>

    <BulmaField label="I would like to receive:" label-class="">
      <input name="FieldName3" type="hidden" value="Newsletter" />
      <label class="checkbox">
        <input type="checkbox" name="FieldValue3" value="yes" checked />
        Spotlight PA's updates and newsletter
      </label>

      <input name="FieldName4" type="hidden" value="Partner promotions" />
      <label class="checkbox">
        <input type="checkbox" name="FieldValue4" value="yes" checked />
        News and offers from Spotlight PA’s partner newsrooms
      </label>
    </BulmaField>

    <div class="buttons is-right">
      <button
        type="button"
        class="button is-warning is-large"
        @click="stepDec"
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
