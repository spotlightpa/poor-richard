<script>
export default {
  props: {
    donationAmount: Number,
    recurring: String,
    firstName: String,
    middleInitial: String,
    lastName: String,
    email: String,
    country: String,
    address1: String,
    address2: String,
    address3: String,
    city: String,
    stateOrProvince: String,
    postalCode: String,
    phoneNumber: String,
    cardName: String,
    ccNumber: String,
    cvv: String,
    expMonth: String,
    expYear: String,
    donationName: String,
    comments: String,
    wantsNewsletter: Boolean,
    wantsPartners: Boolean
  },
  data() {
    return {
      testing: false,
      baseURL: "https://www.spotlightpa.org"
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
    timePeriod() {
      return {
        Month: "monthly",
        Year: "annually",
        "": ""
      }[this.recurring];
    }
  },
  mounted() {
    this.baseURL = window.location.origin;
    this.testing = window.location.search.match(/testing/);
    this.$ga("send", "event", {
      eventCategory: "Donation form",
      eventAction: "Loaded submit page"
    });
  },
  methods: {
    sendSubmit(ev) {
      let eventLabel = ev.target.form.checkValidity()
        ? "Valid submission"
        : "Invalid submission";
      this.$ga("send", "event", {
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
      You will be charged:
      <span class="is-hidden-mobile is-pulled-right">
        {{ donationAmount | formatUSD }} {{ timePeriod }}
      </span>
      <span class="is-hidden-tablet">
        {{ donationAmount | formatUSD }} {{ timePeriod }}
      </span>
    </h2>

    <button
      class="button is-large is-fullwidth has-text-weight-bold"
      :class="testing ? 'is-info' : 'is-warning'"
      name="Subm Donation"
      type="submit"
      @click="sendSubmit"
    >
      <span class="icon">
        <font-awesome-icon icon="lock" />
      </span>
      <span>
        Submit Donation
      </span>
    </button>
    <small>
      Your donation is secured by
      <a href="https://clickandpledge.com">Click And Pledge</a>.
    </small>
    <p>
      &nbsp;
    </p>
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

    <input type="hidden" name="UnitPrice" :value="donationAmount" />
    <input type="hidden" name="ItemID" value="1" />
    <input type="hidden" name="ItemName" value="Donation" />
    <input type="hidden" name="Quantity" value="1" />
    <input type="hidden" name="UnitDeductible" value="100%" />
    <input type="hidden" name="RecurringMethod" value="Subscription" />
    <input type="hidden" name="Installment" :value="installments" />
    <input type="hidden" name="Periodicity" :value="recurring" />
    <input type="hidden" name="recurring" :value="recurring" />
    <input type="hidden" name="BillingFirstName" :value="firstName" />
    <input type="hidden" name="BillingLastName" :value="lastName" />
    <input type="hidden" name="BillingEmail" :value="email" />
    <input type="hidden" name="BillingCountryCode" :value="country" />
    <input type="hidden" name="BillingAddress1" :value="address1" />
    <input type="hidden" name="BillingAddress2" :value="address2" />
    <input type="hidden" name="BillingAddress3" :value="address3" />
    <input type="hidden" name="BillingCity" :value="city" />
    <input type="hidden" name="BillingStateProvince" :value="stateOrProvince" />
    <input type="hidden" name="BillingPostalCode" :value="postalCode" />
    <input type="hidden" name="BillingPhone" :value="phoneNumber" />
    <input type="hidden" name="NameOnCard" :value="cardName" />
    <input type="hidden" name="CardNumber" :value="ccNumber" />
    <input type="hidden" name="Cvv2" :value="cvv" />
    <input type="hidden" name="ExpirationMonth" :value="expMonth" />
    <input type="hidden" name="ExpirationYear" :value="expYear" />
    <input type="hidden" name="FieldName1" value="Donor Name" />
    <input type="hidden" name="FieldValue1" :value="donationName" />
    <input type="hidden" name="FieldName2" value="Additional comments" />
    <input type="hidden" name="FieldValue2" :value="comments" />
    <input type="hidden" name="FieldName3" value="Newsletter" />
    <input type="hidden" name="FieldValue3" :value="wantsNewsletter" />
    <input type="hidden" name="FieldName4" value="Partner promotions" />
    <input type="hidden" name="FieldValue4" :value="wantsPartners" />
    <input type="hidden" name="Campaignid" value="90855" />
    <input type="hidden" name="Organizationid" value="60246" />
    <input type="hidden" name="redirecturl" value="" />
    <input
      type="hidden"
      name="UrlReferrer"
      value="https://www.spotlightpa.org/"
    />
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
