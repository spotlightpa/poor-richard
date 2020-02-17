import "alpinejs";

window.splEmbedList = () => ({
  embedCode: "",
  baseURL: "",
  paramEls: null,
  srcEl: null,
  codeEl: null,
  debounceID: null,
  showCopied: false,

  init($el, $refs) {
    this.baseURL = $el.dataset.url;
    this.paramEls = Array.from($el.querySelectorAll("input[name]"));
    this.srcEl = $el.querySelector("[data-spl-src]");
    this.codeEl = $refs.code;
    this.embedCodeEl = $refs.embedCodeEl;
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
    // set URL on the obj
    this.srcEl.dataset.splSrc = url;
    if (this.srcEl.shadowRoot) {
      this.srcEl.shadowRoot.querySelector("iframe").src = url;
    }
    // get embedCode from the inner HTML
    this.embedCode = this.codeEl.innerHTML.trim();
  },
  copy() {
    let selection = window.getSelection();
    selection.removeAllRanges();
    let range = document.createRange();
    range.selectNodeContents(this.embedCodeEl);
    selection.addRange(range);

    if (document.execCommand("copy")) {
      setTimeout(() => {
        this.showCopied = true;
        setTimeout(() => (this.showCopied = false), 5000);
      }, 500);
    }
  },
  updateParam() {
    clearTimeout(this.debounceID);
    this.debounceID = setTimeout(() => this.setEmbedCode(), 500);
  }
});
