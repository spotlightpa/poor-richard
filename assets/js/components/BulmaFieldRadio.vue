<script>
export default {
  name: "BulmaFieldRadio",
  props: {
    label: String,
    options: Array,
    value: String,
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
  computed: {
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
    emit(ev) {
      this.$emit("input", ev.target.value);
    }
  }
};
</script>

<template>
  <div class="field">
    <div class="label">
      {{ label }}
      <span v-if="required" class="has-text-danger">*</span>
    </div>
    <div class="control">
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
    </div>
    <p v-if="help" class="help" v-text="help"></p>
    <p v-if="validator" class="help is-danger" v-text="validator"></p>
  </div>
</template>
