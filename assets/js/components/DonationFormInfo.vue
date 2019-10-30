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
    },
    stateOrProvince() {
      return this.isUSA ? this.state : this.province;
    }
  },
  watch: {
    donationName(val) {
      this.formData.donationName = val;
    },
    stateOrProvince: {
      handler() {
        this.formData.stateOrProvince = this.stateOrProvince;
      },
      immediate: true
    }
  }
};
</script>

<template>
  <form autocomplete="on" @focus.capture="sendFocus">
    <h2 class="title has-text-centered">
      Donate {{ formData.donationAmount | formatUSD }}
    </h2>
    <h3
      v-if="formData.recurring"
      class="subtitle has-text-centered has-margin-bottom is-spaced"
    >
      Payments recur {{ timePeriod }} until canceled
    </h3>
    <h2 class="title is-size-3">Personal Information</h2>
    <div class="block">
      <div class="columns">
        <div class="column">
          <BulmaFieldInput
            v-model="formData.firstName"
            label="First name"
            :max-length="50"
            :required="true"
            autocomplete="billing given-name"
          ></BulmaFieldInput>
        </div>
        <div class="column">
          <BulmaFieldInput
            v-model="formData.lastName"
            label="Last name"
            :max-length="50"
            :required="true"
            autocomplete="billing family-name"
          ></BulmaFieldInput>
        </div>
        <div class="column">
          <BulmaFieldInput
            v-model="formData.email"
            label="Email address"
            :max-length="50"
            :required="true"
            type="email"
            autocomplete="billing email"
          ></BulmaFieldInput>
        </div>
      </div>
    </div>
    <h2 class="title is-size-3">Billing Address</h2>
    <div class="block">
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
        autocomplete="billing street-address"
      ></BulmaFieldInput>

      <div class="columns">
        <div class="column">
          <BulmaFieldInput
            v-model="formData.city"
            label="City"
            :max-length="50"
            :required="true"
            autocomplete="billing address-level2"
          ></BulmaFieldInput>
        </div>
        <div class="column">
          <BulmaFieldSelect
            v-if="isUSA"
            v-model="state"
            label="State"
            :options="stateOptions"
            :required="true"
            autocomplete="billing address-level1"
          ></BulmaFieldSelect>
          <BulmaFieldInput
            v-else
            v-model="province"
            label="Province or Region"
            :max-length="50"
            :required="true"
            autocomplete="billing address-level1"
          ></BulmaFieldInput>
        </div>
        <div class="column">
          <BulmaFieldInput
            v-model="formData.postalCode"
            :label="zipOrPostalCode"
            :max-length="20"
            :required="true"
            autocomplete="billing postal-code"
          ></BulmaFieldInput>
        </div>
      </div>
    </div>
    <h2 class="title is-size-3">Additional Information</h2>

    <BulmaFieldInput
      v-model="donationName"
      label="How would you like your name to appear in the “Founding Donors” section of our website?"
      label-class=""
      help="To ensure full transparency, we cannot accept anonymous donations."
      autocomplete="name"
      :required="true"
      :max-length="500"
    ></BulmaFieldInput>

    <BulmaField
      v-slot="{ idForLabel }"
      label="I am donating because…"
      label-class=""
    >
      <textarea
        :id="idForLabel"
        v-model="formData.comments"
        class="textarea"
        rows="3"
        placeholder="Optional: Tell us why you’re supporting Spotlight PA."
      ></textarea>
    </BulmaField>

    <BulmaField label="I would like to receive:" label-class="">
      <div>
        <label class="checkbox">
          <input v-model="formData.wantsNewsletter" type="checkbox" disabled />
          Spotlight PA’s updates and newsletter
        </label>
      </div>
      <div>
        <label class="checkbox">
          <input v-model="formData.wantsPartners" type="checkbox" />
          News and offers from Spotlight PA’s partner newsrooms
        </label>
      </div>
    </BulmaField>

    <DonationFormButtons
      @back="stepDec"
      @continue="validate"
    ></DonationFormButtons>
  </form>
</template>
