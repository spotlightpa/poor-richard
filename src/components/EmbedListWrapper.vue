<script>
import EmbedListItem from "./EmbedListItem.vue";
export default {
  components: {
    EmbedListItem
  },
  props: {
    data: Object
  }
};
</script>

<template>
  <EmbedListItem v-bind="data"></EmbedListItem>
</template>
