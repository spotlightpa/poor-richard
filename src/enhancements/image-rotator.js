import randomChoice from "../utils/random-choice.js";

export default function imageRotator(rawChoices) {
  let choices = rawChoices.split(",").map(s=>s.trim());
  return {
    choice: randomChoice(choices),
  };
}
