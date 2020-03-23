import { each } from "./dom-utils.js";

function randomChoice(a) {
  let i = Math.floor(Math.random() * a.length);
  return a[i];
}

export function rotatePromoImages() {
  each("[data-promo-images]", (el) => {
    let images = JSON.parse(el.dataset.promoImages);
    let image = randomChoice(images);
    el.setAttribute("href", image);
  });
}
