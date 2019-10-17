export default {
  name: "KeyListener",
  mounted() {
    this.keyListener = e => {
      this.$emit("keyup", e);
    };
    window.addEventListener("keyup", this.keyListener);
  },
  destroyed() {
    window.removeEventListener("keyup", this.keyListener);
  },
  render() {
    return;
  }
};
