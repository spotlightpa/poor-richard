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
    validationError: String,
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
      inputVal: this.value,
      validationMessage: this.validationError
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
      this.validationMessage = this.$refs.input.validationMessage;
    }
  },
  watch: {
    inputVal(newVal) {
      if (this.maxLength && newVal.length > this.maxLength) {
        newVal = newVal.slice(0, this.maxLength);
      }
      this.$emit("input", newVal);
    },
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
      v-model="inputVal"
      ref="input"
      @blur="updateValidationMessage"
      @invalid="updateValidationMessage"
      @input="updateValidationMessage"
    />
  </BulmaField>
</template>
