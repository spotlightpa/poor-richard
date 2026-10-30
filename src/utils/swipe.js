import { stickyOffset } from "./sticky-scroll.js";

function clamp(n, min, max) {
  return Math.min(max, Math.max(min, n));
}

function reducedMotion() {
  return window.matchMedia("(prefers-reduced-motion: reduce)").matches;
}

function segmentDrag(Alpine) {
  Alpine.directive(
    "segment-drag",
    (el, { expression }, { evaluateLater, effect, cleanup }) => {
      const readView = evaluateLater(expression);
      const setView = evaluateLater("setView");
      const options = ["list", "map"];
      let current = "list";
      let drag = null;
      let dragged = false;

      const pane = (view) =>
        el
          .closest("[data-mobile-tracker]")
          ?.querySelector(`[data-view-pane="${view}"]`);

      const setThumb = (t, active) => {
        el.style.setProperty("--thumb", String(t));
        el.querySelectorAll("[data-segment]").forEach((btn) => {
          btn.toggleAttribute("data-active", btn.dataset.segment === active);
        });
      };

      effect(() => {
        readView((view) => {
          current = view;
          if (!drag) setThumb(options.indexOf(view), view);
        });
      });

      const down = (e) => {
        if (e.pointerType === "mouse" && e.button !== 0) return;
        drag = {
          x: e.clientX,
          y: e.clientY,
          t0: performance.now(),
          base: options.indexOf(current),
          t: options.indexOf(current),
          active: false,
          id: e.pointerId,
        };
        dragged = false;
      };

      const width = () => window.innerWidth;

      const offsets = (d) => {
        const W = width();
        const progress = d.t - d.base;
        const cur = -progress * W;
        const inc = d.base === 0 ? W - d.t * W : -d.t * W;
        return { cur, inc };
      };

      const place = (d) => {
        const { cur, inc } = offsets(d);
        if (d.cur) d.cur.style.transform = `translateX(${cur}px)`;
        if (d.inc) d.inc.style.transform = `translateX(${inc}px)`;
      };

      const showIncoming = (d) => {
        const incoming = pane(options[1 - d.base]);
        const currentPane = pane(current);
        if (!incoming || !currentPane) return;
        const root = el.closest("[data-mobile-tracker]");
        const top =
          incoming.dataset.viewPane === "map"
            ? stickyOffset()
            : Math.max(stickyOffset(), currentPane.getBoundingClientRect().top);
        d.inc = incoming;
        d.cur = currentPane;
        d.top = top;
        incoming.style.display = "block";
        const height =
          incoming.dataset.viewPane === "map"
            ? incoming.offsetHeight
            : Math.max(0, window.innerHeight - top);
        Object.assign(incoming.style, {
          display: "block",
          position: "fixed",
          top: `${top}px`,
          left: "0",
          right: "0",
          height: `${height}px`,
          overflow: "hidden",
          zIndex: "30",
          background: getComputedStyle(root).backgroundColor,
          transition: "none",
        });
        currentPane.style.transition = "none";
        window.dispatchEvent(new Event("resize"));
      };

      const settle = (d, target, ms) => {
        const W = width();
        const go = (node, x) =>
          new Promise((resolve) => {
            if (!node) return resolve();
            node.style.transition = `transform ${ms}ms cubic-bezier(.2,.8,.2,1)`;
            node.style.transform = `translateX(${x}px)`;
            const done = (e) => {
              if (e && e.target !== node) return;
              node.removeEventListener("transitionend", done);
              resolve();
            };
            node.addEventListener("transitionend", done);
            setTimeout(done, ms + 60);
          });
        const commit = target !== current;
        const sign = d.base === 0 ? -1 : 1;
        return Promise.all([
          go(d.cur, commit ? sign * W : 0),
          go(d.inc, commit ? 0 : -sign * W),
        ]);
      };

      const restore = (d, shown) => {
        const props = [
          "position",
          "top",
          "left",
          "right",
          "height",
          "overflow",
          "z-index",
          "background",
          "transition",
          "transform",
        ];
        [d.inc, d.cur].forEach((node) => {
          if (node) props.forEach((prop) => node.style.removeProperty(prop));
        });
        if (d.inc && !shown) d.inc.style.display = "none";
      };

      const move = (e) => {
        if (!drag || e.pointerId !== drag.id) return;
        const dx = e.clientX - drag.x;
        const dy = e.clientY - drag.y;
        if (!drag.active) {
          if (Math.abs(dx) < 6 || Math.abs(dx) < Math.abs(dy)) return;
          drag.active = true;
          el.setPointerCapture?.(e.pointerId);
          el.setAttribute("data-dragging", "");
          if (!reducedMotion()) showIncoming(drag);
        }
        const half = el.getBoundingClientRect().width / 2 || 1;
        drag.t = clamp(drag.base + dx / half, 0, 1);
        drag.dx = dx;
        setThumb(drag.t, drag.t > 0.5 ? "map" : "list");
        if (drag.inc) place(drag);
      };

      const up = (e) => {
        if (!drag || e.pointerId !== drag.id) return;
        const d = drag;
        drag = null;
        if (!d.active) return;
        dragged = true;
        el.removeAttribute("data-dragging");
        const velocity = (d.dx || 0) / Math.max(1, performance.now() - d.t0);
        let next = d.t > 0.5 ? "map" : "list";
        if (Math.abs(velocity) > 0.5) next = velocity > 0 ? "map" : "list";
        setThumb(options.indexOf(next), next);
        const finish = () => {
          if (next === current) return restore(d, false);
          setView(() => {}, { params: [next] });
          requestAnimationFrame(() => restore(d, true));
        };
        if (!d.inc) return finish();
        settle(d, next, 220).then(finish);
      };

      const cancel = (e) => {
        if (!drag || e.pointerId !== drag.id) return;
        const d = drag;
        drag = null;
        el.removeAttribute("data-dragging");
        setThumb(d.base, current);
        restore(d, false);
      };

      const click = (e) => {
        if (!dragged) return;
        dragged = false;
        e.preventDefault();
        e.stopPropagation();
      };

      el.addEventListener("pointerdown", down);
      el.addEventListener("pointermove", move);
      el.addEventListener("pointerup", up);
      el.addEventListener("pointercancel", cancel);
      el.addEventListener("click", click, true);
      cleanup(() => {
        el.removeEventListener("pointerdown", down);
        el.removeEventListener("pointermove", move);
        el.removeEventListener("pointerup", up);
        el.removeEventListener("pointercancel", cancel);
        el.removeEventListener("click", click, true);
      });
    },
  );
}

export default function swipe(Alpine) {
  segmentDrag(Alpine);
  Alpine.directive(
    "swipe",
    (el, { expression }, { evaluateLater, cleanup }) => {
      const run = evaluateLater(expression);
      let start = null;
      let swiped = false;

      const down = (e) => {
        if (e.pointerType === "mouse" && e.button !== 0) return;
        start = { x: e.clientX, y: e.clientY };
        swiped = false;
      };
      const up = (e) => {
        if (!start) return;
        const dx = e.clientX - start.x;
        const dy = e.clientY - start.y;
        start = null;
        if (Math.abs(dx) < 24 || Math.abs(dx) < Math.abs(dy)) return;
        swiped = true;
        run(() => {}, { scope: { $direction: dx > 0 ? "right" : "left" } });
      };
      const cancel = () => {
        start = null;
      };
      const click = (e) => {
        if (!swiped) return;
        swiped = false;
        e.preventDefault();
        e.stopPropagation();
      };

      el.addEventListener("pointerdown", down);
      el.addEventListener("pointerup", up);
      el.addEventListener("pointercancel", cancel);
      el.addEventListener("click", click, true);
      cleanup(() => {
        el.removeEventListener("pointerdown", down);
        el.removeEventListener("pointerup", up);
        el.removeEventListener("pointercancel", cancel);
        el.removeEventListener("click", click, true);
      });
    },
  );
}
