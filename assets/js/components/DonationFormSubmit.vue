<script>
import DonationFormMixin from "./DonationFormMixin.js";

export default {
  mixins: [DonationFormMixin],
  data() {
    return {
      isSubmitting: false,
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
      return this.formData.recurring ? "999" : "";
    },
    type() {
      return this.testing ? "text" : "hidden";
    },
    submitClasses() {
      let color = this.testing ? "is-info" : "is-warning";
      let classes = [color];
      if (this.isSubmitting) {
        classes.push("is-loading");
      }
      return classes;
    },
    ccDigitsEnd() {
      let match = String(this.formData.ccNumber).match(/\d+(\d{4})/);
      return match ? match[1] : "????";
    }
  },
  mounted() {
    this.baseURL = window.location.origin;
  },
  methods: {
    sendSubmit(ev) {
      if (this.isSubmitting) {
        ev.preventDefault();
        return;
      }
      this.isSubmitting = true;
      let eventValue = this.formData.donationAmount;
      if (this.formData.recurring === "Month") {
        // Assume an 8% churn on monthly subscribers
        eventValue *= 12;
      }
      this.$ga("send", "event", {
        eventCategory: "Donation form",
        eventAction: "Submit form",
        eventValue,
        transport: "beacon"
      });
    }
  }
};
</script>

<template>
  <form method="post" :action="cnpURL" @focus.capture="sendFocus">
    <DonationFormBreadcrumbs
      :step-obj="stepObj"
      :testing="testing"
    ></DonationFormBreadcrumbs>

    <h2 class="title">
      You will be charged:
      <span class="is-hidden-mobile is-pulled-right">
        {{ formData.donationAmount | formatUSD }} {{ timePeriod }}
      </span>
      <span class="is-hidden-tablet">
        {{ formData.donationAmount | formatUSD }} {{ timePeriod }}
      </span>
    </h2>

    <button
      class="button is-large is-fullwidth has-text-weight-bold"
      :class="submitClasses"
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
    <p>
      Your name will appear as “{{ formData.donationName }}” on the list of
      founding donors. Charges will appear on credit card ending
      {{ ccDigitsEnd }}. <a @click="stepDec">Go back</a> to correct your
      information.
    </p>
    <p>
      &nbsp;
    </p>
    <h2 class="title">Terms &amp; Conditions</h2>
    <p>
      Your gift is tax-deductible to the extent allowed by law. Please note that
      all gifts are donated to The Lenfest Institute for Journalism and directed
      to Spotlight PA’s important investigative work. Spotlight PA editors and
      reporters operate independently of our donors and maintain editorial
      control over all of the content they produce. Because we are committed to
      fully disclosing all of our sources of funding, we cannot accept anonymous
      donations. Please contact
      <a href="mailto:joanna@spotlightpa.org">joanna@spotlightpa.org</a> if you
      have any questions.
    </p>

    <input :type="type" name="UnitPrice" :value="formData.donationAmount" />
    <input :type="type" name="ItemID" value="1" />
    <input :type="type" name="ItemName" value="Donation" />
    <input :type="type" name="Quantity" value="1" />
    <input :type="type" name="UnitDeductible" value="100%" />
    <input :type="type" name="RecurringMethod" value="Subscription" />
    <input :type="type" name="Installment" :value="installments" />
    <input :type="type" name="Periodicity" :value="formData.recurring" />
    <input :type="type" name="recurring" :value="formData.recurring" />
    <input :type="type" name="BillingFirstName" :value="formData.firstName" />
    <input :type="type" name="BillingLastName" :value="formData.lastName" />
    <input :type="type" name="BillingEmail" :value="formData.email" />
    <input :type="type" name="BillingCountryCode" :value="formData.country" />
    <input :type="type" name="BillingAddress1" :value="formData.address1" />
    <input :type="type" name="BillingAddress2" :value="formData.address2" />
    <input :type="type" name="BillingAddress3" :value="formData.address3" />
    <input :type="type" name="BillingCity" :value="formData.city" />
    <input
      :type="type"
      name="BillingStateProvince"
      :value="formData.stateOrProvince"
    />
    <input :type="type" name="BillingPostalCode" :value="formData.postalCode" />
    <input :type="type" name="BillingPhone" :value="formData.phoneNumber" />
    <input :type="type" name="NameOnCard" :value="formData.cardName" />
    <input :type="type" name="CardNumber" :value="formData.ccNumber" />
    <input :type="type" name="Cvv2" :value="formData.cvv" />
    <input :type="type" name="ExpirationMonth" :value="formData.expMonth" />
    <input :type="type" name="ExpirationYear" :value="formData.expYear" />
    <input :type="type" name="FieldName1" value="Donor Name" />
    <input :type="type" name="FieldValue1" :value="formData.donationName" />
    <input :type="type" name="FieldName2" value="Additional comments" />
    <input :type="type" name="FieldValue2" :value="formData.comments" />
    <input :type="type" name="FieldName3" value="Newsletter" />
    <input :type="type" name="FieldValue3" :value="formData.wantsNewsletter" />
    <input :type="type" name="FieldName4" value="Partner promotions" />
    <input :type="type" name="FieldValue4" :value="formData.wantsPartners" />
    <input :type="type" name="Campaignid" value="90855" />
    <input :type="type" name="Organizationid" value="60246" />
    <input
      :type="type"
      name="UrlReferrer"
      value="https://www.spotlightpa.org/"
    />
    <input :type="type" name="OnSuccessUrl" :value="successURL" />
    <input :type="type" name="OnDeclineUrl" :value="sorryURL" />
    <input :type="type" name="OnErrorUrl" :value="sorryURL" />
    <input
      :type="type"
      name="AccountGuid"
      value="4c7c323d-466b-4492-b3e8-e5689bd9d775"
    />
    <input :type="type" name="AccountID" value="60246" />
    <input :type="type" name="accountAlias" value="lenfestinstitute" />
    <input :type="type" name="ConnectCampaignAlias" value="SpotlightPA" />
    <input :type="type" name="SendReceipt" value="true" />
    <input
      :type="type"
      name="ReceiptTemplateGUID"
      value="131a8ef4-0653-4e65-b774-20df83c36fa5"
    />
    <input :type="type" name="OrderMode" value="Production" />
    <input :type="type" name="TransactionType" value="Payment" />
    <input :type="type" name="PaymentType" value="CreditCard" />
  </form>
</template>
