export default function sendEvent({
  el,
  name,
  detail = null,
  bubbles = true,
  cancelable = true,
  composed = true,
}) {
  el.dispatchEvent(
    new CustomEvent(name, {
      detail,
      bubbles,
      cancelable,
      composed,
    })
  );
}
