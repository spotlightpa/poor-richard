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
    updateValidationMessage(ev) {
      this.validationMessage = ev.target.validationMessage;
    }
  }
};
</script>

<template>
  <BulmaField v-slot="{ idForLabel }" v-bind="fieldProps">
    <div class="select is-fullwidth">
      <select
        :id="idForLabel"
        ref="select"
        v-model="selected"
        :name="name"
        :required="required"
        @blur="updateValidationMessage"
        @change="updateValidationMessage"
        @invalid="updateValidationMessage"
      >
        <option
          v-for="option of options"
          :key="option.text"
          :value="option.value"
          v-text="option.text"
        />
      </select>
    </div>
  </BulmaField>
</template>
