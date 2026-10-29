function clamp(n, min, max) {
  return Math.min(max, Math.max(min, n));
}

function reducedMotion() {
  return window.matchMedia("(prefers-reduced-motion: reduce)").matches;
}

function animate(el, from, to, ms) {
  if (!el || reducedMotion()) {
    if (el) el.style.transform = el.style.opacity = "";
    return Promise.resolve();
  }
  return new Promise((resolve) => {
    const done = () => {
      el.removeEventListener("transitionend", done);
      el.style.transition = "";
      resolve();
    };
    el.style.transition = "none";
    el.style.transform = `translateX(${from.x}px)`;
    el.style.opacity = String(from.o);
    requestAnimationFrame(() => {
      el.style.transition = `transform ${ms}ms cubic-bezier(.2,.8,.2,1), opacity ${ms}ms ease-out`;
      el.style.transform = to.x ? `translateX(${to.x}px)` : "";
      el.style.opacity = to.o === 1 ? "" : String(to.o);
      el.addEventListener("transitionend", done);
      setTimeout(done, ms + 60);
    });
  });
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

      const move = (e) => {
        if (!drag || e.pointerId !== drag.id) return;
        const dx = e.clientX - drag.x;
        const dy = e.clientY - drag.y;
        if (!drag.active) {
          if (Math.abs(dx) < 6 || Math.abs(dx) < Math.abs(dy)) return;
          drag.active = true;
          el.setPointerCapture?.(e.pointerId);
          el.setAttribute("data-dragging", "");
        }
        const half = el.getBoundingClientRect().width / 2 || 1;
        drag.t = clamp(drag.base + dx / half, 0, 1);
        drag.dx = dx;
        setThumb(drag.t, drag.t > 0.5 ? "map" : "list");
        const p = pane(current);
        if (p && !reducedMotion()) {
          const shift = (drag.t - drag.base) * -0.35 * window.innerWidth;
          p.style.transition = "none";
          p.style.transform = `translateX(${shift}px)`;
          p.style.opacity = String(1 - Math.abs(drag.t - drag.base) * 0.35);
        }
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
        const p = pane(current);
        const from = {
          x: (d.t - d.base) * -0.35 * window.innerWidth,
          o: 1 - Math.abs(d.t - d.base) * 0.35,
        };
        if (next === current) {
          setThumb(d.base, current);
          animate(p, from, { x: 0, o: 1 }, 220);
          return;
        }
        const dir = next === "map" ? -1 : 1;
        setThumb(options.indexOf(next), next);
        animate(
          p,
          from,
          { x: dir * 0.35 * window.innerWidth, o: 0.4 },
          120,
        ).then(() => {
          if (p) p.style.transform = p.style.opacity = "";
          setView(() => {}, { params: [next] });
          requestAnimationFrame(() =>
            animate(
              pane(next),
              { x: -dir * 0.25 * window.innerWidth, o: 0.5 },
              { x: 0, o: 1 },
              240,
            ),
          );
        });
      };

      const cancel = (e) => {
        if (!drag || e.pointerId !== drag.id) return;
        const d = drag;
        drag = null;
        el.removeAttribute("data-dragging");
        setThumb(d.base, current);
        const p = pane(current);
        if (p) p.style.transform = p.style.opacity = "";
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
