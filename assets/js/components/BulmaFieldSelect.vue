<script>
import BulmaField from "./BulmaField.vue";

export default {
  name: "BulmaFieldSelect",
  components: {
    BulmaField
  },
  props: {
    label: String,
    labelClass: {
      type: String,
      default: "label"
    },
    help: String,
    required: {
      type: Boolean,
      default: false
    },
    options: Array,
    value: String,
    name: String
  },
  data() {
    return {
      selected: this.value,
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
  watch: {
    selected(newVal) {
      this.$emit("input", newVal);
    },
    validationError(newVal) {
      this.$refs.select.setCustomValidity(newVal);
      this.validationMessage = newVal;
    }
  },
  methods: {
    updateValidationMessage() {
      this.validationMessage = this.$refs.select.validationMessage;
    }
  }
};
</script>

<template>
  <BulmaField v-bind="fieldProps" v-slot="{ idForLabel }">
    <div class="select is-fullwidth">
      <select
        v-model="selected"
        :id="idForLabel"
        :name="name"
        :required="required"
        ref="select"
        @blur="updateValidationMessage"
        @change="updateValidationMessage"
        @invalid="updateValidationMessage"
      >
        <option
          v-for="option in options"
          :key="option.text"
          :value="option.value"
          v-text="option.text"
        />
      </select>
    </div>
  </BulmaField>
</template>
