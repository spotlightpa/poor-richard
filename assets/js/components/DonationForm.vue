<script>
import BulmaFieldInput from "./BulmaFieldInput.vue";
import BulmaFieldRadio from "./BulmaFieldRadio.vue";
import BulmaFieldSelect from "./BulmaFieldSelect.vue";

let currencyFormat = new Intl.NumberFormat("en-US", {
  style: "currency",
  currency: "USD"
});

export default {
  data() {
    return {
      testing: true,
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
      _cardName: "",
      _donationName: ""
    };
  },
  components: {
    BulmaFieldInput,
    BulmaFieldRadio,
    BulmaFieldSelect
  },
  filters: {
    formatUSD(amount) {
      return currencyFormat.format(amount);
    }
  },
  computed: {
    cnpURL() {
      return this.testing
        ? "https://verify.faas.cloud.clickandpledge.com"
        : "https://faas.cloud.clickandpledge.com";
    },
    installments() {
      return this.recurring ? "999" : "";
    },
    cardName: {
      get() {
        if (this._cardName) {
          return this._cardName;
        }
        let name = `${this.firstName} ${this.middleInitial}`.trim();
        name += ` ${this.lastName}`;
        return name.trim();
      },
      set(newVal) {
        this._cardName = newVal;
      }
    },
    donationName: {
      get() {
        if (this._donationName) {
          return this._donationName;
        }
        return `${this.firstName} ${this.lastName}`.trim();
      },
      set(newVal) {
        this._donationName = newVal;
      }
    }
  },
  methods: {
    validate(e) {
      // e.preventDefault();
    },
    setDonationAmount(amount) {
      this.donationAmount = amount;
      this.showOtherAmount = false;
    },
    toggleOtherAmount() {
      this.donationAmount = null;
      this.showOtherAmount = true;
    }
  }
};
</script>

<template>
  <form method="post" :action="cnpURL" @submit="validate">
    <h2 class="title">
      Donation Amount
    </h2>
    <div v-for="(row, i) of amounts" class="buttons">
      <button
        class="button is-primary"
        :class="{ 'is-outlined': donationAmount !== amount }"
        v-for="amount in row"
        @click.prevent="setDonationAmount(amount)"
      >
        ${{ amount }}
      </button>
      <button
        v-if="i == 1"
        class="button is-primary is-outlined"
        @click.prevent="toggleOtherAmount"
      >
        Other
      </button>
    </div>
    <BulmaFieldInput
      v-if="showOtherAmount"
      label="Other Amount"
      name="name"
      v-model="donationAmount"
      :autofocus="true"
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
      :options="recurringOptions"
      name="recurring"
      v-model="recurring"
    ></BulmaFieldRadio>
    <input type="hidden" name="RecurringMethod" value="Subscription" />
    <input type="hidden" name="Installment" :value="installments" />
    <input type="hidden" name="Periodicity" :value="recurring" />

    <h2 class="title">Billing and Contact Information</h2>
    <div class="columns">
      <div class="column">
        <BulmaFieldInput
          label="First Name"
          labelClass=""
          name="BillingFirstName"
          :max-length="50"
          :required="true"
          :autocomplete="true"
          placeholder="William"
          v-model="firstName"
        ></BulmaFieldInput>
      </div>
      <div class="column">
        <BulmaFieldInput
          label="Middle Initial"
          labelClass=""
          name="BillingMI"
          :max-length="1"
          :required="false"
          :autocomplete="true"
          placeholder=""
          v-model="middleInitial"
        ></BulmaFieldInput>
      </div>
      <div class="column">
        <BulmaFieldInput
          label="Last Name"
          labelClass=""
          name="name"
          :max-length="50"
          :required="true"
          :autocomplete="true"
          placeholder="Penn"
          v-model="lastName"
        ></BulmaFieldInput>
      </div>
    </div>
    <h2 class="title">Payment Details</h2>
    <BulmaFieldInput
      label="Name on Card"
      name="name"
      :required="true"
      placeholder="William Penn"
      v-model="cardName"
    ></BulmaFieldInput>

    <h2 class="title">Additional Information</h2>
    <h2 class="title">Terms & Conditions</h2>
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

    <BulmaFieldInput
      label='To ensure full transparency, we cannot accept anonymous donations. How would you like your name to appear in the "Founding Donors" section of our website?'
      label-class=""
      name="name"
      placeholder="William Penn"
      :required="true"
      v-model="donationName"
    ></BulmaFieldInput>

    <h2 class="title">
      You will be charged:
      <span class="is-pulled-right">{{ donationAmount | formatUSD }}</span>
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
    >
      Submit Donation
    </button>

    <!-- 3 pages need to be set up for each of the 3 transaction outcomes, namely Authorized, Declined, and Error -->
    <input type="hidden" name="OnSuccessUrl" value="" />
    <input type="hidden" name="OnDeclineUrl" value="" />
    <input type="hidden" name="OnErrorUrl" value="" />

    <input type="hidden" name="Thankyou_SuccessRedirectURL" value="" />
    <input type="hidden" name="Thankyou_DeclineRedirecturl" value="" />

    <!-- Click &amp; pledge account information -->
    <input
      type="hidden"
      name="AccountGuid"
      value="4c7c323d-466b-4492-b3e8-e5689bd9d775"
    />
    <input type="hidden" name="AccountID" value="60246" />
    <input type="hidden" name="accountAlias" value="lenfestinstitute" />
    <input type="hidden" name="ConnectCampaignAlias" value="SpotlightPA" />
    <!-- If no additional receipt nodes are listed the campaign receipt settings will be used. -->
    <!-- You may customize the receipt further by setting a different receipt template to be sent-->
    <input type="hidden" name="SendReceipt" value="true" />
    <input
      type="hidden"
      name="ReceiptTemplateGUID"
      value="131a8ef4-0653-4e65-b774-20df83c36fa5"
    />
    <input type="hidden" name="OrderMode" value="Production" />
    <input type="hidden" name="TransactionType" value="Payment" />
    <input name="PaymentType" type="hidden" value="CreditCard" />
  </form>
</template>
