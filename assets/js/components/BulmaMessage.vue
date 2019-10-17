<script>
export default {
  props: {
    header: String,
    headerRight: String,
    closeButton: Function
  }
};
</script>

<template>
  <div class="message">
    <div class="message-header">
      <p v-text="header"></p>
      <p v-if="headerRight" v-text="headerRight"></p>
      <button
        v-if="closeButton"
        class="delete"
        type="button"
        aria-label="delete"
        @click="closeButton"
      ></button>
    </div>
    <div class="message-body">
      <slot></slot>
    </div>
  </div>
</template>
