export default function sanitizeText(text) {
  let el = document.createElement("div");
  el.innerText = text;
  text = el.innerHTML;
  text = text
    .replace(/&lt;b&gt;/g, "<strong>")
    .replace(/&lt;\/b&gt;/g, "</strong>")
    .replace(/&lt;i&gt;/g, "<em>")
    .replace(/&lt;\/i&gt;/g, "</em>");
  return text;
}
