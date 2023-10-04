const magicWebpFile =
  "data:image/webp;base64,UklGRiQAAABXRUJQVlA4IBgAAAAwAQCdASoBAAEAAwA0JaQAA3AA/vuUAAA=";

function testWebpSupport() {
  return new Promise((resolve, reject) => {
    let img = new Image();
    img.onload = resolve;
    img.onerror = reject;
    img.src = magicWebpFile;
  });
}

let supportsWebp = null;

testWebpSupport()
  .then(() => {
    supportsWebp = true;
  })
  .catch(() => {
    supportsWebp = false;
  });

export default function imageURL(
  filepath,
  { width = 400, height = 300, extension = "jpeg" } = {},
) {
  if (!filepath) {
    return "";
  }
  if (supportsWebp && extension === "jpeg") {
    extension = "webp";
  }
  let baseURL = "https://www.spotlightpa.org/imgproxy";
  let signature = "insecure";
  let resizing_type = "fill";
  let gravity = "sm";
  let enlarge = "1";
  let quality = "75";
  let encoded_source_url = btoa(filepath);

  return `${baseURL}/${signature}/rs:${resizing_type}:${width}:${height}/g:${gravity}/el:${enlarge}/q:${quality}/${encoded_source_url}.${extension}`;
}
