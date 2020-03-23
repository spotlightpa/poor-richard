<script>
let labelIDCounter = 0;

export default {
  name: "BulmaField",
  props: {
    label: String,
    labelClass: {
      type: String,
      default: "label",
    },
    controlClass: String,
    help: String,
    validationMessage: String,
    required: {
      type: Boolean,
      default: false,
    },
  },
  data() {
    labelIDCounter++;
    return {
      idForLabel: `BulmaField-${labelIDCounter}`,
    };
  },
};
</script>

<template>
  <div class="field">
    <label :class="labelClass" :for="idForLabel">
      {{ label }}
      <span v-if="required" class="has-text-danger">*</span>
    </label>
    <div class="control" :class="controlClass">
      <slot :required="required" :idForLabel="idForLabel"></slot>
    </div>
    <p v-if="help" class="help" v-text="help"></p>
    <p
      v-if="validationMessage"
      class="help is-danger"
      v-text="validationMessage"
    ></p>
  </div>
</template>
