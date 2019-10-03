<script>
export default {
  name: "BulmaFieldInput",
  props: {
    label: String,
    value: [String,Number],
    placeholder: String,
    help: String,
    validator: String,
    name: String,
    required: {
      type: Boolean,
      default: false
    },
    type: {
      type: String,
      default: "text"
    }
  },
  methods: {
    emit(ev) {
      this.$emit("input", ev.target.value);
    },
    focus() {
      this.$nextTick(() => {
        this.$refs.input.focus();
      });
    }
  }
};
</script>

<template>
  <div class="field">
    <label class="label">
      {{ label }}
      <span v-if="required" class="has-text-danger">*</span>
    </label>
    <div class="control">
      <input
        class="input"
        :name="name"
        :type="type"
        :placeholder="placeholder"
        :value="value"
        @input="emit"
        ref="input"
      />
    </div>
    <p v-if="help" class="help" v-text="help"></p>
    <p v-if="validator" class="help is-danger" v-text="validator"></p>
  </div>
</template>
