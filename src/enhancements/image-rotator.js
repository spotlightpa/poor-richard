import shuffle from "../utils/random-shuffle.js";

let choiceCache = new Map();

export default function imageRotator(choices) {
  if (!choices) {
    choices = [];
  }
  choices.sort();
  let key = JSON.stringify(choices);
  let [shuffledChoices = null, i = 0] = choiceCache.get(key) ?? [];
  if (!shuffledChoices) {
    shuffledChoices = shuffle(choices);
    choiceCache.set(key, [shuffledChoices, i]);
  }
  return {
    get choice() {
      let choice = shuffledChoices[i];
      i++;
      i %= shuffledChoices.length;
      choiceCache.set(key, [shuffledChoices, i]);
      return choice;
    },
  };
}
