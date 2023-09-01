export default function tabs() {
  return {
    selectedPos: 0,
    children: [],
    init() {
      this.children = this.$el.querySelectorAll("[data-pos]");
    },
    next() {
      if (this.selectedPos >= this.children.length - 1) return;
      this.selectedPos++;
    },
    prev() {
      if (this.selectedPos <= 0) return;
      this.selectedPos--;
    },
    showPanel(pos) {
      this.selectedPos = pos;
    },
    isSelected(el) {
      return this.selectedPos === +el.dataset.pos;
    },
    get atBeginning() {
      return this.selectedPos === 0;
    },
    get atEnd() {
      return this.selectedPos === this.children.length - 1;
    },
  };
}
