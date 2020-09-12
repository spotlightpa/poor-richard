export default function fetchJSON(url) {
  return fetch(url).then((rsp) => {
    if (!rsp.ok) {
      let err = new Error(
        `Unexpected response: ${url} ${rsp.status} ${rsp.statusText}`
      );
      err.name = "Request error";
      throw err;
    }
    return rsp.json();
  });
}
