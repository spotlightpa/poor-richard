let loadAlpine = null;
window.deferLoadingAlpine = (cb) => {
  loadAlpine = cb;
};

import "alpinejs";

import readmore from "./read-more.js";
import mostPopular from "./most-popular.js";
import embedList from "./embed-list.js";
import modal from "./modal.js";

window.spl = Object.assign({}, window.spl, {
  readmore,
  mostPopular,
  embedList,
  modal,
});

export function load() {
  if (loadAlpine) {
    loadAlpine();
  }
  window.deferLoadingAlpine = (cb) => void cb();
}
