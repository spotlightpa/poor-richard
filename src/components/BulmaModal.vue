<script>
import WindowListener from "./WindowListener.js";

export default {
  name: "BulmaModal",
  components: {
    WindowListener
  },
  props: {
    value: Boolean
  },
  watch: {
    value(newVal) {
      let root = window.document.body.parentElement;
      // IE11 has broken classList.toggle
      if (newVal) {
        root.classList.add("is-clipped");
      } else {
        root.classList.remove("is-clipped");
      }
    }
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
      <window-listener event="keyup" @keyup.esc="close"></window-listener>
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
