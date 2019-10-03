<script>
export default {
  name: "BulmaFieldInput",
  props: {
    label: String,
    value: String,
    placeholder: String,
    help: String,
    validator: String,
    type: {
      type: String,
      default: "text"
    }
  },
  methods: {
    emit(ev) {
      this.$emit("input", ev.target.value);
    }
  }
};
</script>

<template>
  <div class="field">
    <label class="label" v-text="label"></label>
    <div class="control">
      <input
        class="input"
        :type="type"
        :placeholder="placeholder"
        :value="value"
        @input="emit"
      />
    </div>
    <p v-if="help" class="help" v-text="help"></p>
    <p v-if="validator" class="help is-danger" v-text="validator"></p>
  </div>
</template>
