export function stickyOffset() {
  const nav = document.querySelector("header.sticky");
  let offset = nav ? nav.getBoundingClientRect().height : 0;
  const desktop = window.matchMedia("(min-width: 850px)").matches;
  if (desktop) {
    const bar = document.querySelector("[data-tracker-header]");
    if (bar) offset += Number(bar.dataset.pinnedH) || 66;
  } else {
    const bar = document.querySelector("[data-mobile-bar]");
    if (bar) offset += bar.offsetHeight;
  }
  return offset;
}

export function scrollToStickyTop(el, { smooth = false } = {}) {
  if (!el) return;
  const target = () =>
    Math.max(
      0,
      el.getBoundingClientRect().top + window.pageYOffset - stickyOffset(),
    );
  const correct = () => {
    const top = target();
    if (Math.abs(window.pageYOffset - top) > 2) {
      window.scrollTo({ top, behavior: "instant" });
    }
  };
  const start = target();
  if (!smooth || Math.abs(window.pageYOffset - start) < 2) {
    window.scrollTo({ top: start, behavior: "instant" });
    requestAnimationFrame(correct);
    return;
  }
  let done = false;
  const finish = () => {
    if (done) return;
    done = true;
    window.removeEventListener("scrollend", finish);
    correct();
  };
  window.addEventListener("scrollend", finish);
  setTimeout(finish, 1200);
  window.scrollTo({ top: start, behavior: "smooth" });
}
