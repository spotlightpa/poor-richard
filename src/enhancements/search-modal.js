export default function searchModal() {
  return {
    oldFocus: null,
    isOpen: false,

    get modalClass() {
      return this.isOpen ? "is-active" : "";
    },

    open() {
      this.isOpen = true;

      document.body.parentElement.classList.add("is-clipped");

      this.oldFocus = document.activeElement;
      this.$nextTick(() => {
        this.$el.querySelector("input").focus();
      });
    },

    close() {
      this.oldFocus.focus();
      document.body.parentElement.classList.remove("is-clipped");

      this.isOpen = false;
    },
  };
}
