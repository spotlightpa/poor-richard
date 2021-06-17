import randomChoice from "../utils/random-choice.js";

export default function imageRotator() {
  return {
    choice: "",
    init() {
      let { images } = this.$attrs;
      this.choice = randomChoice(images);
    },
  };
}
