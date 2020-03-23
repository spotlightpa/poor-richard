<script>
import BulmaField from "./BulmaField.vue";

export default {
  name: "BulmaFieldInput",
  components: {
    BulmaField,
  },
  props: {
    label: String,
    labelClass: {
      type: String,
      default: "label",
    },
    value: String,
    placeholder: String,
    help: String,
    validator: Function,
    name: String,
    inputmode: String,
    minLength: {
      type: Number,
      default: null,
    },
    maxLength: {
      type: Number,
      default: null,
    },
    required: {
      type: Boolean,
      default: false,
    },
    autofocus: {
      type: Boolean,
      default: false,
    },
    autocomplete: {
      type: String,
      default: null,
    },
    type: {
      type: String,
      default: "text",
    },
  },
  data() {
    return {
      validationMessage: "",
    };
  },
  computed: {
    fieldProps() {
      return {
        label: this.label,
        help: this.help,
        labelClass: this.labelClass,
        required: this.required,
        validationMessage: this.validationMessage,
      };
    },
  },
  watch: {
    value(newVal) {
      if (this.validator) {
        let message = this.validator(newVal);
        this.$refs.input.setCustomValidity(message);
        this.validationMessage = message;
      }
    },
  },
  methods: {
    updateValidationMessage(ev) {
      this.validationMessage = ev.target.validationMessage;
    },
    updateValue(ev) {
      let newVal = ev.target.value;
      if (this.maxLength && newVal.length > this.maxLength) {
        newVal = newVal.slice(0, this.maxLength);
      }
      this.updateValidationMessage(ev);
      this.$emit("input", newVal);
    },
  },
};
</script>

<template>
  <BulmaField ref="field" v-slot="{ idForLabel }" v-bind="fieldProps">
    <input
      :id="idForLabel"
      ref="input"
      class="input"
      :autocomplete="autocomplete"
      :autofocus="autofocus"
      :inputmode="inputmode"
      :maxlength="maxLength"
      :minlength="minLength"
      :name="name"
      :placeholder="placeholder"
      :required="required"
      :type="type"
      :value="value"
      @blur="updateValidationMessage"
      @invalid="updateValidationMessage"
      @input="updateValue"
    />
  </BulmaField>
</template>
