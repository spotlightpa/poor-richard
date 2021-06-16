import randomChoice from "../utils/random-choice.js";

export default function imageRotator() {
  return {
    choice: "",
    init() {
      let choices = this.$el.dataset.images.split(",").map((s) => s.trim());
      this.choice = randomChoice(choices);
    },
  };
}
