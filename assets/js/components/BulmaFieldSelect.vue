<script>
export default {
  name: "BulmaFieldSelect",
  props: {
    label: String,
    options: Array,
    value: String,
    placeholder: String,
    help: String,
    validator: String
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
  }
};
</script>

<template>
  <div class="field">
    <label class="label" v-text="label"></label>
    <div class="control is-expanded">
      <div class="select is-fullwidth">
        <select v-model="selected">
          <option
            v-for="option in options"
            :key="option.value"
            :value="option.value"
            v-text="option.text"
          />
        </select>
      </div>
    </div>
    <p v-if="help" class="help" v-text="help"></p>
    <p v-if="validator" class="help is-danger" v-text="validator"></p>
  </div>
</template>
