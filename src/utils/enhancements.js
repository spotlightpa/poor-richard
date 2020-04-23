let loadAlpine = null;
window.deferLoadingAlpine = (cb) => {
  loadAlpine = cb;
};

import "alpinejs";

import readmore from "./read-more.js";

window.spl = window.spl || {};

window.spl.readmore = readmore;

export function load() {
  if (loadAlpine) {
    loadAlpine();
  }
  window.deferLoadingAlpine = (cb) => void cb();
}
