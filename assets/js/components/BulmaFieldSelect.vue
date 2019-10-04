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
    validationError: String,
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
    },
    selected: {
      get() {
        return this.value;
      },
      set(newVal) {
        this.$emit("input", newVal);
      }
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
        @input="updateValidationMessage"
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
