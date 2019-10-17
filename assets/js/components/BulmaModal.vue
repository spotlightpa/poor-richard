<script>
import KeyListener from "./KeyListener.js";

export default {
  name: "BulmaModal",
  components: {
    KeyListener
  },
  props: {
    value: Boolean
  },
  methods: {
    close() {
      this.$emit("input", false);
    }
  }
};
</script>

<template>
  <transition name="fade">
    <div v-if="value" class="modal is-active">
      <key-listener @keyup.esc="close"></key-listener>
      <div class="modal-background" @click="close"></div>
      <div class="modal-content">
        <slot :modal-close="close"></slot>
      </div>
      <button
        class="modal-close is-large"
        type="button"
        aria-label="close"
        @click="close"
      ></button>
    </div>
  </transition>
</template>
