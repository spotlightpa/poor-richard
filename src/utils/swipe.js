export default function swipe(Alpine) {
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
