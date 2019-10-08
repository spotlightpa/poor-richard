<script>
import BulmaField from "./BulmaField.vue";
import BulmaFieldInput from "./BulmaFieldInput.vue";
import BulmaFieldRadio from "./BulmaFieldRadio.vue";
import BulmaFieldSelect from "./BulmaFieldSelect.vue";

import { hasValidLuhn } from "../luhn.js";
import {
  codeUSA,
  countryOptions,
  stateOptions,
  monthOptions
} from "../form-data.js";

let currencyFormat = new Intl.NumberFormat("en-US", {
  style: "currency",
  currency: "USD"
});

function ccValidator(val) {
  return hasValidLuhn(val) ? "" : "Please enter a valid credit card number";
}

export default {
  components: {
    BulmaField,
    BulmaFieldInput,
    BulmaFieldRadio,
    BulmaFieldSelect
  },
  filters: {
    formatUSD(amount) {
      return currencyFormat.format(amount);
    }
  },
  data() {
    return {
      testing: false,
      baseURL: "https://www.spotlightpa.org",
      amounts: [["25", "50", "75", "100"], ["200", "500", "1000"]],
      donationAmount: "50",
      showOtherAmount: false,
      recurring: "",
      recurringOptions: [
        { text: "One time only", value: "" },
        { text: "Monthly", value: "Month" },
        { text: "Yearly", value: "Year" }
      ],
      firstName: "",
      middleInitial: "",
      lastName: "",
      email: "",
      country: codeUSA,
      countryOptions,
      address1: "",
      address2: "",
      address3: "",
      city: "",
      province: "",
      state: "Pennsylvania",
      stateOptions,
      zipcode: "",
      phoneNumber: "",
      setCardName: false,
      cardNameVal: "",
      ccNumber: "",
      ccValidator,
      cvv: "",
      expMonth: "",
      monthOptions,
      expYear: "",
      setDonationName: false,
      donationNameVal: ""
    };
  },
  computed: {
    cnpURL() {
      return this.testing
        ? "https://verify.faas.cloud.clickandpledge.com"
        : "https://faas.cloud.clickandpledge.com";
    },
    sorryURL() {
      return this.baseURL + "/donate/sorry/";
    },
    successURL() {
      return this.baseURL + "/donate/thanks/";
    },
    installments() {
      return this.recurring ? "999" : "";
    },
    cardName: {
      get() {
        if (this.setCardName) {
          return this.cardNameVal;
        }
        let name = `${this.firstName} ${this.middleInitial}`.trim();
        name += ` ${this.lastName}`;
        return name.trim();
      },
      set(newVal) {
        this.setCardName = true;
        this.cardNameVal = newVal;
      }
    },
    donationName: {
      get() {
        if (this.setDonationName) {
          return this.donationNameVal;
        }
        return `${this.firstName} ${this.lastName}`.trim();
      },
      set(newVal) {
        this.setDonationName = true;
        this.donationNameVal = newVal;
      }
    },
    isUSA() {
      return this.country === codeUSA;
    },
    zipOrPostalCode() {
      return this.isUSA ? "Zipcode" : "Postal Code";
    },
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
    ccDigits() {
      return this.ccNumber.replace(/\D/g, "");
    },
    timePeriod() {
      return this.recurring === "Month"
        ? "monthly"
        : this.recurring === "Year"
        ? "annually"
        : "";
    }
  },
  mounted() {
    this.baseURL = window.location.origin;
    this.testing = window.location.search.match(/testing/);
    this.$ga("send", "event", {
      eventCategory: "Donation form",
      eventAction: "Saw donation form",
      nonInteraction: true
    });
  },
  methods: {
    setDonationAmount(amount) {
      this.donationAmount = amount;
      this.showOtherAmount = false;
    },
    toggleOtherAmount() {
      this.donationAmount = null;
      this.showOtherAmount = true;
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
    sendSubmit(ev) {
      let eventLabel = ev.target.form.checkValidity()
        ? "Valid submission"
        : "Invalid submission";
      ga("send", "event", {
        eventCategory: "Donation form",
        eventAction: "Submit form",
        eventLabel,
        transport: "beacon"
      });
    }
  }
};
</script>

<template>
  <form
    method="post"
    :action="cnpURL"
    autocomplete="on"
    @focus.capture="sendFocus"
  >
    <h2 class="title">
      Donation Amount
    </h2>
    <div v-for="(row, i) of amounts" :key="i" class="buttons">
      <button
        v-for="amount of row"
        :key="amount"
        class="button is-primary"
        :class="{ 'is-outlined': donationAmount !== amount }"
        type="button"
        @click="setDonationAmount(amount)"
      >
        ${{ amount }}
      </button>
      <button
        v-if="i == 1"
        class="button is-primary is-outlined"
        type="button"
        @click="toggleOtherAmount"
      >
        Other
      </button>
    </div>
    <BulmaFieldInput
      v-if="showOtherAmount"
      v-model="donationAmount"
      label="Other Amount"
      :autofocus="true"
      :required="true"
    ></BulmaFieldInput>
    <input type="hidden" name="UnitPrice" :value="donationAmount" />
    <input type="hidden" name="ItemID" value="1" />
    <input type="hidden" name="ItemName" value="Donation" />
    <input type="hidden" name="Quantity" value="1" />
    <input type="hidden" name="UnitDeductible" value="100%" />

    <h2 class="title">
      Want to make it recurring?
    </h2>
    <BulmaFieldRadio
      v-model="recurring"
      :options="recurringOptions"
      name="recurring"
    ></BulmaFieldRadio>
    <input type="hidden" name="RecurringMethod" value="Subscription" />
    <input type="hidden" name="Installment" :value="installments" />
    <input type="hidden" name="Periodicity" :value="recurring" />

    <h2 class="title">Billing and Contact Information</h2>
    <div class="columns">
      <div class="column">
        <BulmaFieldInput
          v-model="firstName"
          label="First Name"
          name="BillingFirstName"
          :max-length="50"
          :required="true"
          autocomplete="billing given-name"
          placeholder="William"
        ></BulmaFieldInput>
      </div>
      <div class="column">
        <BulmaFieldInput
          v-model="middleInitial"
          label="Middle Initial"
          name="BillingMI"
          :max-length="1"
          :required="false"
          autocomplete="billing additional-name"
          placeholder=""
        ></BulmaFieldInput>
      </div>
      <div class="column">
        <BulmaFieldInput
          v-model="lastName"
          label="Last Name"
          name="BillingLastName"
          :max-length="50"
          :required="true"
          autocomplete="billing family-name"
          placeholder="Penn"
        ></BulmaFieldInput>
      </div>
    </div>
    <BulmaFieldInput
      v-model="email"
      label="Email"
      name="BillingEmail"
      :max-length="50"
      type="email"
      :required="true"
      autocomplete="billing email"
      placeholder="mysylvania@example.com"
    ></BulmaFieldInput>
    <BulmaFieldSelect
      v-model="country"
      label="Country"
      :options="countryOptions"
      name="BillingCountryCode"
      :required="true"
      autocomplete="billing country"
    ></BulmaFieldSelect>
    <BulmaFieldInput
      v-model="address1"
      label="Address"
      name="BillingAddress1"
      :max-length="100"
      :required="true"
      autocomplete="billing address-line1"
      placeholder="123 Main St."
    ></BulmaFieldInput>
    <BulmaFieldInput
      v-if="address1"
      v-model="address2"
      name="BillingAddress2"
      :max-length="100"
      autocomplete="billing address-line2"
      placeholder="Apt. 2B"
    ></BulmaFieldInput>
    <BulmaFieldInput
      v-if="address2"
      v-model="address3"
      name="BillingAddress3"
      :max-length="100"
      autocomplete="billing address-line3"
    ></BulmaFieldInput>

    <div class="columns">
      <div class="column">
        <BulmaFieldInput
          v-model="city"
          label="City"
          name="BillingCity"
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
          name="BillingStateProvince"
          :options="stateOptions"
          :required="true"
          autocomplete="billing address-level2"
        ></BulmaFieldSelect>
        <BulmaFieldInput
          v-else
          v-model="province"
          label="Province or Region"
          name="BillingStateProvince"
          :max-length="50"
          :required="true"
          autocomplete="billing address-level2"
        ></BulmaFieldInput>
      </div>
    </div>
    <div class="columns">
      <div class="column">
        <BulmaFieldInput
          v-model="zipcode"
          :label="zipOrPostalCode"
          name="BillingPostalCode"
          placeholder="17120"
          :max-length="20"
          :required="true"
          autocomplete="billing postal-code"
        ></BulmaFieldInput>
      </div>
      <div class="column">
        <BulmaFieldInput
          v-model="phoneNumber"
          label="Phone number"
          type="tel"
          name="BillingPhone"
          :required="true"
          autocomplete="billing tel-national"
          placeholder="717-555-1234"
        ></BulmaFieldInput>
      </div>
    </div>

    <h2 class="title">Payment Details</h2>
    <BulmaFieldInput
      v-model="cardName"
      label="Name on Card"
      name="NameOnCard"
      :required="true"
      autocomplete="cc-name"
      placeholder="William Penn"
    ></BulmaFieldInput>
    <div class="columns">
      <div class="column">
        <input type="hidden" name="CardNumber" :value="ccDigits" />
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
          v-model="cvv"
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
          v-model="expMonth"
          label="Expiration Month"
          name="ExpirationMonth"
          :options="monthOptions"
          :required="true"
          autocomplete="cc-exp-month"
        ></BulmaFieldSelect>
      </div>
      <div class="column">
        <BulmaFieldSelect
          v-model="expYear"
          label="Expiration Year"
          name="ExpirationYear"
          :options="expirationYears"
          :required="true"
          autocomplete="cc-exp-year"
        ></BulmaFieldSelect>
      </div>
    </div>

    <h2 class="title">Additional Information</h2>
    <input name="FieldName1" type="hidden" value="Donor Name" />
    <BulmaFieldInput
      v-model="donationName"
      label='How would you like your name to appear in the "Founding Donors" section of our website?'
      label-class=""
      help="To ensure full transparency, we cannot accept anonymous donations."
      name="FieldValue1"
      placeholder="William Penn"
      autocomplete="name"
      :required="true"
      :max-length="500"
    ></BulmaFieldInput>

    <input name="FieldName2" type="hidden" value="Additional comments" />
    <BulmaField v-slot="{ idForLabel }" label="Additional Comments">
      <textarea
        :id="idForLabel"
        name="FieldValue2"
        class="textarea"
        rows="3"
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

    <h2 class="title">Terms &amp; Conditions</h2>
    <p>
      Your gift is tax-deductible to the extent allowed by law. Please note that
      all gifts are donated to The Lenfest Institute for Journalism and directed
      to Spotlight PA's important investigative work.
    </p>
    <p>
      Spotlight PA editors and reporters operate independently of our donors and
      maintain editorial control over all of the content they produce. Because
      we are committed to fully disclosing all of our sources of funding, we
      cannot accept anonymous donations.
    </p>
    <p>
      Please contact
      <a href="mailto:joanna@spotlightpa.org">joanna@spotlightpa.org</a> if you
      have any questions.
    </p>
    <h2 class="title">
      You will be charged:
      <span class="is-hidden-mobile is-pulled-right">
        {{ donationAmount | formatUSD }} {{ timePeriod }}
      </span>
      <span class="is-hidden-tablet">
        {{ donationAmount | formatUSD }} {{ timePeriod }}
      </span>
    </h2>

    <input type="hidden" name="Campaignid" value="90855" />
    <input type="hidden" name="Organizationid" value="60246" />
    <input type="hidden" name="redirecturl" value="" />
    <input
      type="hidden"
      name="UrlReferrer"
      value="https://www.spotlightpa.org/"
    />

    <button
      class="button is-warning is-large is-fullwidth has-text-weight-bold"
      name="Subm Donation"
      type="submit"
      @click="sendSubmit"
    >
      Submit Donation
    </button>

    <!-- 3 pages need to be set up for each of the 3 transaction outcomes, namely Authorized, Declined, and Error -->
    <input type="hidden" name="OnSuccessUrl" :value="successURL" />
    <input type="hidden" name="OnDeclineUrl" :value="sorryURL" />
    <input type="hidden" name="OnErrorUrl" :value="sorryURL" />

    <input
      type="hidden"
      name="AccountGuid"
      value="4c7c323d-466b-4492-b3e8-e5689bd9d775"
    />
    <input type="hidden" name="AccountID" value="60246" />
    <input type="hidden" name="accountAlias" value="lenfestinstitute" />
    <input type="hidden" name="ConnectCampaignAlias" value="SpotlightPA" />
    <input type="hidden" name="SendReceipt" value="true" />
    <input
      type="hidden"
      name="ReceiptTemplateGUID"
      value="131a8ef4-0653-4e65-b774-20df83c36fa5"
    />
    <input type="hidden" name="OrderMode" value="Production" />
    <input type="hidden" name="TransactionType" value="Payment" />
    <input type="hidden" name="PaymentType" value="CreditCard" />
  </form>
</template>
