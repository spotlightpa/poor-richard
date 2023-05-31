import { addGAListeners } from "./google-analytics.js";
import { on, onLoad } from "./dom-utils.js";

onLoad(() => {
  on("click", "a[data-gone]", (ev) => {
    ev.preventDefault();
    let url = ev.currentTarget.dataset.gone;
    let msg =
      "The target of this link has been removed. " +
      `It pointed to ${url}. ` +
      "Would you like to try to visit anyway?";
    if (window.confirm(msg)) {
      window.location = url;
    }
  });

  addGAListeners();
});
