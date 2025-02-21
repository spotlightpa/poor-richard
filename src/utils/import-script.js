let scripts = new Map();

export default function importScript(url) {
  let p = scripts.get(url);
  if (p) {
    return p;
  }
  let script = document.createElement("script");
  p = new Promise((resolve, reject) => {
    script.onload = resolve;
    script.onerror = (e) => {
      scripts.delete(url);
      reject(e);
    };
  });
  script.src = url;
  document.body.append(script);
  scripts.set(url, p);
  return p;
}
