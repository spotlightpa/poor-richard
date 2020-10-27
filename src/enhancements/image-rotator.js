import randomChoice from "../utils/random-choice.js";

export default function imageRotator(rawChoices) {
  let choices = rawChoices.split(",");
  return {
    choice: randomChoice(choices),
  };
}
