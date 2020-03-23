<script>
export default {
  props: {
    hasPrevious: { type: Boolean, default: true },
  },
};
</script>

<template>
  <div class="buttons is-right">
    <button
      v-if="hasPrevious"
      type="button"
      class="button is-light"
      @click="$emit('back', $event)"
    >
      <span class="icon">
        <font-awesome-icon :icon="['far', 'arrow-alt-circle-left']" />
      </span>
      <span>
        Back
      </span>
    </button>

    <button
      type="button"
      class="button is-danger"
      @click="$emit('continue', $event)"
    >
      <span>
        Continue
      </span>
      <span class="icon">
        <font-awesome-icon :icon="['far', 'arrow-alt-circle-right']" />
      </span>
    </button>
  </div>
</template>
