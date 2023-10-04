export default function fetchJSON(url) {
  // https://stackoverflow.com/a/63814972/4893152
  let u = new URL(url);
  let opts =
    u.origin === window.location.origin
      ? { credentials: "include", mode: "no-cors" }
      : {};
  return fetch(u, opts).then((rsp) => {
    if (!rsp.ok) {
      let err = new Error(
        `Unexpected response: ${url} ${rsp.status} ${rsp.statusText}`,
      );
      err.name = "Request error";
      throw err;
    }
    return rsp.json();
  });
}
