<script>
import BulmaField from "./BulmaField.vue";

export default {
  name: "BulmaFieldRadio",
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
  computed: {
    fieldProps() {
      return {
        label: this.label,
        help: this.help,
        labelClass: this.labelClass,
        required: this.required
      };
    },
    selected: {
      get() {
        return this.value;
      },
      set(newVal) {
        this.$emit("input", newVal);
      }
    }
  }
};
</script>

<template>
  <BulmaField v-bind="fieldProps">
    <label v-for="option of options" :key="option.value" class="radio">
      <input
        v-model="selected"
        type="radio"
        :name="name"
        :value="option.value"
        :required="required"
      />
      {{ option.text }}
    </label>
  </BulmaField>
</template>
