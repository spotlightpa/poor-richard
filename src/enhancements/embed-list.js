export default function embedList() {
  return {
    embedCode: "",
    baseURL: "",
    scriptSrc: "",
    paramEls: null,
    srcEl: null,
    debounceID: null,
    showCopied: false,

    init() {
      this.$setAttrs(this, { scriptSrc: "scriptSrc", baseURL: "url" });
      this.paramEls = Array.from(this.$el.querySelectorAll("input[name]"));
      this.srcEl = this.$el.querySelector("[data-spl-src]");
      this.setEmbedCode();
    },
    setEmbedCode() {
      // go through the params and make the URL
      let url = this.baseURL;
      let params = [];
      for (let paramEl of this.paramEls) {
        let { name, value } = paramEl;
        if (value) {
          params.push({ name, value });
        }
      }
      if (params.length) {
        url +=
          "?" +
          params
            .map(({ name, value }) => name + "=" + encodeURIComponent(value))
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
    copy() {
      let selection = window.getSelection();
      selection.removeAllRanges();
      let range = document.createRange();
      range.selectNodeContents(this.$refs.embedCodeEl);
      selection.addRange(range);

      if (document.execCommand("copy")) {
        selection.removeAllRanges();
        this.showCopied = true;
        setTimeout(() => {
          this.showCopied = false;
        }, 5000);
      }
    },
    updateParam() {
      clearTimeout(this.debounceID);
      this.debounceID = setTimeout(() => this.setEmbedCode(), 500);
    },
  };
}
