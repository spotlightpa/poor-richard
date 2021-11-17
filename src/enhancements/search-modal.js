export default function searchModal() {
  return {
    isOpen: false,

    init() {
      this.$watch("isOpen", (val) => {
        if (!val) {
          this.$report({ target: this.$refs.closer });
        }
      });
    },

    get modalClass() {
      return { "is-active": this.isOpen };
    },
  };
}
