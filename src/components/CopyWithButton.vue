<script>
import CopyTextarea from "./CopyTextarea.vue";

export default {
  name: "CopyWithButton",
  components: {
    CopyTextarea
  },
  props: {
    value: String,
    label: {
      type: String,
      default: "text"
    },
    size: {
      type: String,
      default: ""
    }
  },
  data() {
    return {
      copied: false
    };
  }
};
</script>

<template>
  <div class="has-margin-bottom">
    <div class="field">
      <div class="control">
        <CopyTextarea
          ref="copier"
          :size="size"
          @copied="copied = $event"
          v-text="value"
        ></CopyTextarea>
      </div>
    </div>
    <div class="field">
      <div class="buttons">
        <button
          type="button"
          class="button is-primary has-text-weight-semibold"
          title="Copy"
          @click="$refs.copier.copy()"
        >
          <span class="icon">
            <font-awesome-icon :icon="['far', 'copy']" />
          </span>
          <span> Copy {{ label }} </span>
        </button>
        <transition name="fade">
          <div
            v-if="copied"
            class="tag is-rounded is-success is-light has-text-weight-semibold"
          >
            Copied
          </div>
        </transition>
      </div>
    </div>
  </div>
</template>
