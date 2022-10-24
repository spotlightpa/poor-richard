export default function sanitizeText(text) {
  let el = document.createElement("div");
  el.innerText = text;
  text = el.innerHTML;
  text = text
    .replace(/&lt;b&gt;/g, "<b>")
    .replace(/&lt;\/b&gt;/g, "</b>")
    .replace(/&lt;i&gt;/g, "<i>")
    .replace(/&lt;\/i&gt;/g, "</i>");
  return text;
}
