import BulmaField from "./BulmaField.vue";
import BulmaFieldInput from "./BulmaFieldInput.vue";
import BulmaFieldSelect from "./BulmaFieldSelect.vue";
import BulmaMessage from "./BulmaMessage.vue";
import BulmaModal from "./BulmaModal.vue";

import DonationFormButtons from "./DonationFormButtons.vue";
import DonationFormBreadcrumbs from "./DonationFormBreadcrumbs.vue";

export default {
  components: {
    BulmaField,
    BulmaFieldInput,
    BulmaFieldSelect,
    BulmaMessage,
    BulmaModal,
    DonationFormButtons,
    DonationFormBreadcrumbs
  },
  props: {
    formData: Object,
    stepObj: Object,
    testing: Boolean
  },
  computed: {
    timePeriod() {
      return {
        Month: "monthly",
        Year: "annually",
        "": ""
      }[this.formData.recurring];
    },
    perPeriod() {
      return {
        Month: "/month",
        Year: "/year",
        "": ""
      }[this.formData.recurring];
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
    }
  }
};
