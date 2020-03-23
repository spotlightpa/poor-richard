<script>
export default {
  props: {
    stepObj: Object,
    testing: Boolean,
  },
};
</script>

<template>
  <nav
    class="breadcrumb is-centered is-large has-arrow-separator has-margin-bottom"
    aria-label="breadcrumbs"
  >
    <ul>
      <li
        v-for="(step, i) of stepObj.items"
        :key="step.name"
        :class="{ 'is-active': i >= stepObj.n && !testing }"
      >
        <a
          :class="{ 'has-text-success': i == stepObj.n }"
          @click="stepObj.n = i"
          v-text="step.name"
        ></a>
      </li>
    </ul>
  </nav>
</template>
