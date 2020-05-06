let loadAlpine = null;
window.deferLoadingAlpine = (cb) => {
  loadAlpine = cb;
};

import "alpinejs";

import embedList from "../enhancements/embed-list.js";
import feed from "../enhancements/feed.js";
import intersector from "../enhancements/intersector.js";
import modal from "../enhancements/modal.js";
import mostPopular from "../enhancements/most-popular.js";
import readmore from "../enhancements/read-more.js";
import sticky from "../enhancements/sticky.js";

window.spl = Object.assign({}, window.spl, {
  embedList,
  feed,
  intersector,
  modal,
  mostPopular,
  readmore,
  sticky,
});

export function load() {
  if (loadAlpine) {
    loadAlpine();
  }
  window.deferLoadingAlpine = (cb) => void cb();
}
