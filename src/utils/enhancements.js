let loadAlpine = null;
window.deferLoadingAlpine = (cb) => {
  loadAlpine = cb;
};

import "alpinejs";

import readmore from "../enhancements/read-more.js";
import mostPopular from "../enhancements/most-popular.js";
import embedList from "../enhancements/embed-list.js";
import modal from "../enhancements/modal.js";
import sticky from "../enhancements/sticky.js";

window.spl = Object.assign({}, window.spl, {
  readmore,
  mostPopular,
  embedList,
  modal,
  sticky,
});

export function load() {
  if (loadAlpine) {
    loadAlpine();
  }
  window.deferLoadingAlpine = (cb) => void cb();
}
