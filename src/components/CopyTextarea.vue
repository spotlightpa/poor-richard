<script>
export default {
  name: "CopyTextarea",
  props: {
    size: {
      type: String,
      default: "is-medium"
    }
  },
  data() {
    return {
      isFocused: false
    };
  },
  methods: {
    click() {
      if (!this.isFocused) {
        this.isFocused = true;
        this.select();
      }
    },
    select() {
      let range = document.createRange();
      range.selectNodeContents(this.$refs.textarea);
      let selection = window.getSelection();
      selection.removeAllRanges();
      selection.addRange(range);
    },
    copy() {
      this.select();
      this.$nextTick(() => {
        if (document.execCommand("copy")) {
          this.$emit("copied", true);
          window.setTimeout(() => {
            this.$emit("copied", false);
          }, 5000); // 5s
        }
      });
    }
  }
};
</script>

<template>
  <div
    ref="textarea"
    class="textarea pre-wrap"
    rows="bulmaoverride"
    :class="size"
    contenteditable
    @click="click"
    @blur="isFocused = false"
    @focus="select"
  >
    <slot></slot>
  </div>
</template>

<style scoped>
.pre-wrap {
  white-space: pre-wrap;
}
</style>
