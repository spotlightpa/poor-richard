import Scroller from "@newswire/scroller";

export function addScrollListener() {
  const scroller = new Scroller({
    scenes: document.querySelectorAll(".scene")
  });

  scroller.on("scene:enter", d => {
    console.log(d);
    d.element.classList.add("active");
  });

  scroller.on("scene:exit", d => {
    d.element.classList.remove("active");
  });

  scroller.init();
}
