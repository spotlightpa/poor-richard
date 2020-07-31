import BulmaField from "./BulmaField.vue";
import BulmaFieldInput from "./BulmaFieldInput.vue";
import BulmaFieldSelect from "./BulmaFieldSelect.vue";
import BulmaMessage from "./BulmaMessage.vue";
import BulmaModal from "./BulmaModal.vue";

import DonationFormButtons from "./DonationFormButtons.vue";

let currencyFormat = new Intl.NumberFormat("en-US", {
  style: "currency",
  currency: "USD",
});

export default {
  components: {
    BulmaField,
    BulmaFieldInput,
    BulmaFieldSelect,
    BulmaMessage,
    BulmaModal,
    DonationFormButtons,
  },
  props: {
    formData: Object,
    stepObj: Object,
    testing: Boolean,
  },
  computed: {
    timePeriod() {
      return {
        Month: "monthly",
        Year: "annually",
        "": "",
      }[this.formData.recurring];
    },
    perPeriod() {
      return {
        Month: "/month",
        Year: "/year",
        "": "",
      }[this.formData.recurring];
    },
  },
  methods: {
    sendFocus(ev) {
      let [label] = ev.target.labels;
      let eventLabel = label ? label.innerText : ev.target.name;
      this.$gae({
        eventLabel: "donate:focus:" + eventLabel,
      });
    },
    validate(ev) {
      let valid = ev.currentTarget.form.reportValidity();
      if (valid) {
        this.validStepInc();
      }
    },
    // Override in DonationFormAmount
    validStepInc() {
      this.stepInc();
    },
    stepInc() {
      this.$emit("change-step", +1);
    },
    stepDec() {
      this.$emit("change-step", -1);
    },
    formatUSD(amount) {
      return currencyFormat.format(amount);
    },
  },
};
