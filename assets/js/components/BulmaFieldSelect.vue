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
    validator: String,
    required: {
      type: Boolean,
      default: false
    },
    options: Array,
    value: String
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
  <BulmaField v-bind="fieldProps" v-slot="{ idForLabel }">
    <div class="select is-fullwidth">
      <select :id="idForLabel" v-model="selected">
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
