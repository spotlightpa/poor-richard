import BulmaField from "./BulmaField.vue";
import BulmaFieldInput from "./BulmaFieldInput.vue";
import BulmaFieldSelect from "./BulmaFieldSelect.vue";
import BulmaMessage from "./BulmaMessage.vue";
import BulmaModal from "./BulmaModal.vue";

import { DonationFormData } from "../form-data.js";

export default {
  components: {
    BulmaField,
    BulmaFieldInput,
    BulmaFieldSelect,
    BulmaMessage,
    BulmaModal
  },
  props: {
    formData: Object,
    testing: Boolean
  },
  computed: {
    timePeriod() {
      return {
        Month: "monthly",
        Year: "annually",
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
