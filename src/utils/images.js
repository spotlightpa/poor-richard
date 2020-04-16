import { each } from "./dom-utils.js";
import imgproxy from "./imgproxy-url.js";

export function loadImages() {
  each("img[data-path]", (el) => {
    let { offsetWidth: width, offsetHeight: height } = el;
    if (!width || !height) {
      return;
    }
    let pixelRatio = window.devicePixelRatio ?? 1;
    width = pixelRatio * width;
    height = pixelRatio * height;

    el.src = imgproxy(el.dataset.path, { width, height });
  });
}
