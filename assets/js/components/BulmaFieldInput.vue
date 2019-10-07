<script>
import BulmaField from "./BulmaField.vue";

export default {
  name: "BulmaFieldInput",
  components: {
    BulmaField
  },
  props: {
    label: String,
    labelClass: {
      type: String,
      default: "label"
    },
    value: String,
    placeholder: String,
    help: String,
    validator: Function,
    name: String,
    minLength: {
      type: Number,
      default: null
    },
    maxLength: {
      type: Number,
      default: null
    },
    required: {
      type: Boolean,
      default: false
    },
    autofocus: {
      type: Boolean,
      default: false
    },
    autocomplete: {
      type: String,
      default: null
    },
    type: {
      type: String,
      default: "text"
    }
  },
  data() {
    return {
      validationMessage: ""
    };
  },
  computed: {
    fieldProps() {
      return {
        label: this.label,
        help: this.help,
        labelClass: this.labelClass,
        required: this.required,
        validationMessage: this.validationMessage
      };
    }
  },
  methods: {
    updateValidationMessage(ev) {
      this.validationMessage = ev.target.validationMessage;
      if (!this.validationMessage && this.validator) {
        this.validationMessage = this.validator(ev.target.value);
      }
    },
    updateValue(ev) {
      let newVal = ev.target.value;
      if (this.maxLength && newVal.length > this.maxLength) {
        newVal = newVal.slice(0, this.maxLength);
      }
      this.updateValidationMessage(ev);
      this.$emit("input", newVal);
    }
  },
  watch: {
    validationError(newVal) {
      this.$refs.input.setCustomValidity(newVal);
      this.validationMessage = newVal;
    }
  }
};
</script>

<template>
  <BulmaField v-bind="fieldProps" v-slot="{ idForLabel }" ref="field">
    <input
      class="input"
      :id="idForLabel"
      :type="type"
      :name="name"
      :placeholder="placeholder"
      :autofocus="autofocus"
      :autocomplete="autocomplete"
      :required="required"
      :minlength="minLength"
      :maxlength="maxLength"
      :value="value"
      ref="input"
      @blur="updateValidationMessage"
      @invalid="updateValidationMessage"
      @input="updateValue"
    />
  </BulmaField>
</template>
