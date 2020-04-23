let loadAlpine = null;
window.deferLoadingAlpine = (cb) => {
  loadAlpine = cb;
};

import "alpinejs";

import readmore from "./read-more.js";
import mostPopular from "./most-popular.js";

window.spl = window.spl || {};

window.spl.readmore = readmore;
window.spl.mostPopular = mostPopular;

export function load() {
  if (loadAlpine) {
    loadAlpine();
  }
  window.deferLoadingAlpine = (cb) => void cb();
}
