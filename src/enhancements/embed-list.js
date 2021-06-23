import { after } from "../utils/timers.js";

export default function embedList() {
  return {
    embedCode: "",
    baseURL: "",
    scriptSrc: "",
    params: new Map(),
    srcEl: null,
    showCopied: false,

    init() {
      this.$setAttrs(this, { scriptSrc: "scriptSrc", baseURL: "url" });
      this.srcEl = this.$el.querySelector("[data-spl-src]");
      this.setEmbedCode();
    },
    setEmbedCode() {
      // go through the params and make the URL
      let url = this.baseURL;
      let params = Array.from(this.params.entries()).filter(([, v]) => v);
      if (params.length) {
        url +=
          "?" +
          params
            .map(([name, value]) => name + "=" + encodeURIComponent(value))
            .join("&");
      }
      let fullURL =
        url + "#host_page=" + encodeURIComponent(window.location.href);

      // set URL on the obj
      if (this.srcEl.shadowRoot) {
        this.srcEl.shadowRoot.querySelector("iframe").src = fullURL;
      }
      // set embedCode to copy
      this.embedCode =
        `<script src="${this.scriptSrc}" async></script>` +
        `<div data-spl-embed-version="1" data-spl-src="${url}"></div>`;
    },
    async copy() {
      try {
        await navigator.clipboard.writeText(this.embedCode);
        this.showCopied = true;
        await after({ seconds: 5 });
        this.showCopied = false;
      } catch (e) {
        alert(`Could not copy embed code: ${e.message}.`);
      }
    },
    updateParams() {
      this.params.set(this.$el.name, this.$el.value);
      this.setEmbedCode();
    },
  };
}
