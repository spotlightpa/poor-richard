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
    value: [String, Number],
    placeholder: String,
    help: String,
    validator: String,
    name: String,
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
        if (this.maxLength && newVal.length > this.maxLength) {
          newVal = newVal.slice(0, this.maxLength);
        }
        this.$emit("input", newVal);
      }
    }
  }
};
</script>

<template>
  <BulmaField v-bind="fieldProps" v-slot="{ idForLabel }">
    <input
      class="input"
      :id="idForLabel"
      :type="type"
      :name="name"
      :placeholder="placeholder"
      :autofocus="autofocus"
      :autocomplete="autocomplete"
      :required="required"
      :maxlength="maxLength"
      v-model="selected"
    />
  </BulmaField>
</template>
