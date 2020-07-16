export default function sendEvent({
  el = window,
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
