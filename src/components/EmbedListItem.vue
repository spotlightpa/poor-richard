<script>
import { each } from "../utils/dom-utils.js";
import BulmaFieldInput from "./BulmaFieldInput.vue";
import CopyWithButton from "./CopyWithButton.vue";

export default {
  components: {
    BulmaFieldInput,
    CopyWithButton
  },
  props: {
    params: Array,
    title: String,
    url: String,
    scriptSrc: String
  },
  data() {
    let paramsData =
      this.params?.map(param => ({ ...param, value: param.default })) ?? [];
    return { debounceID: null, showIframe: false, pageFrames: [], paramsData };
  },
  computed: {
    embedURL() {
      let url = this.url;
      let filteredParams = this.paramsData.filter(param => param.value);
      if (filteredParams.length) {
        url +=
          "?" +
          filteredParams
            .map(param => param.name + "=" + encodeURIComponent(param.value))
            .join("&");
      }
      return url;
    },
    embedCode() {
      return (
        `<script src="${this.scriptSrc}" async></` +
        `script><div data-spl-embed-version="1" data-spl-src="${this.embedURL}"></div>`
      );
    }
  },
  watch: {
    embedURL(val) {
      clearTimeout(this.debounceID);
      this.debounceID = setTimeout(() => {
        this.pageFrames.forEach(el => {
          let iframe = el.shadowRoot?.firstChild;
          if (iframe) {
            iframe.src = val;
          }
        });
      }, 500);
    }
  },
  mounted() {
    this.$nextTick(() => {
      each("[data-spl-src]", el => {
        if (el.dataset.splSrc === this.url) {
          this.pageFrames.push(el);
        }
      });
    });
  }
};
</script>
<template>
  <div class="block">
    <template v-if="paramsData.length">
      <h2 class="subtitle is-4">Parameters:</h2>

      <BulmaFieldInput
        v-for="param of paramsData"
        :key="param.name"
        v-model="param.value"
        :label="param.hint"
        :placeholder="param.default"
      ></BulmaFieldInput>
    </template>
    <h3 class="subtitle is-4">Code:</h3>
    <CopyWithButton
      :value="embedCode"
      description="embed code"
    ></CopyWithButton>
  </div>
</template>
