import randomChoice from "../utils/random-choice.js";

export default function imageRotator(choices) {
  return {
    choice: "",
    init() {
      this.choice = randomChoice(choices);
    },
  };
}
