<script>
import BulmaField from "./BulmaField.vue";

export default {
  name: "BulmaFieldRadio",
  components: {
    BulmaField
  },
  data() {
    return {
      selected: this.value
    };
  },
  props: {
    label: String,
    labelClass: {
      type: String,
      default: "label"
    },
    help: String,
    validator: String,
    required: {
      type: Boolean,
      default: false
    },
    options: Array,
    value: String,
    name: String
  },
  computed: {
    fieldProps() {
      return {
        label: this.label,
        help: this.help,
        labelClass: this.labelClass,
        required: this.required,
        validator: this.validator
      };
    }
  },
  watch: {
    selected(newVal) {
      this.$emit("input", newVal);
    }
  }
};
</script>

<template>
  <BulmaField v-bind="fieldProps">
    <label class="radio" v-for="option in options" :key="option.value">
      <input
        type="radio"
        :name="name"
        :value="option.value"
        :required="required"
        v-model="selected"
      />
      {{ option.text }}
    </label>
  </BulmaField>
</template>
