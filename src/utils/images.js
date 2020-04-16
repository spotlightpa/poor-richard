import { each, on } from "./dom-utils.js";
import imgproxy from "./imgproxy-url.js";

export function loadImages() {
  each("img[data-path]", (el) => {
    let cb = () => {
      let { offsetWidth: width, offsetHeight: height } = el;
      if (!width || !height) {
        return;
      }
      let pixelRatio = window.devicePixelRatio ?? 1;
      width = pixelRatio * width;
      height = pixelRatio * height;

      el.src = imgproxy(el.dataset.path, { width, height });
    };
    if (document.readyState === "loading") {
      el.addEventListener("load", cb);
    } else {
      cb();
    }
  });
}
