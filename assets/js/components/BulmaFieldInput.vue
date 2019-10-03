<script>
let labelIDCounter = 0;

export default {
  name: "BulmaFieldInput",
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
      type: Boolean,
      default: null
    },
    type: {
      type: String,
      default: "text"
    }
  },
  data() {
    labelIDCounter++;
    return {
      idForLabel: `BulmaFieldInput-${labelIDCounter}`
    };
  },
  computed: {
    selected: {
      get() {
        return this.value;
      },
      set(newVal) {
        this.$emit("input", newVal);
      }
    },
    autocompleteStr() {
      return this.autocomplete === null
        ? null
        : this.autocomplete
        ? "on"
        : "off";
    }
  }
};
</script>

<template>
  <div class="field">
    <label :class="labelClass" :for="idForLabel">
      {{ label }}
      <span v-if="required" class="has-text-danger">*</span>
    </label>
    <div class="control">
      <input
        class="input"
        :id="idForLabel"
        :type="type"
        :name="name"
        :placeholder="placeholder"
        :autofocus="autofocus"
        :autocomplete="autocompleteStr"
        :required="required"
        :maxlength="maxLength"
        v-model="selected"
      />
    </div>
    <p v-if="help" class="help" v-text="help"></p>
    <p v-if="validator" class="help is-danger" v-text="validator"></p>
  </div>
</template>
