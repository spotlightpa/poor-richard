import randomChoice from "../utils/random-choice.js";

export default function imageRotator() {
  return {
    choice: "",
    init() {
      let { choices } = this.$setAttrs({}, { choices: "@images" });
      this.choice = randomChoice(choices);
    },
  };
}
