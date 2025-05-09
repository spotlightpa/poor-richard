import { after } from "../utils/timers.js";

async function fetchOrRedirect(url, opts) {
  let data = await fetch(url, opts)
    .then((rsp) => rsp.json())
    .catch((err) => {
      return { error: `${err}` };
    });
  // Retry Gateway Timeout once after a second
  if (data.statuscode === 504) {
    await after({ seconds: 1 });
    data = await fetch(url, opts)
      .then((rsp) => rsp.json())
      .catch((err) => {
        return { error: `${err}` };
      });
  }
  if (data.error) {
    let msg = encodeURIComponent(data.error);
    let code = data.statuscode ? encodeURIComponent(data.statuscode) : "";
    let errors = data.details
      ? encodeURIComponent(JSON.stringify(data.details))
      : "";
    window.top.location.href = `/newsletters/sorry/?code=${code}&msg=${msg}&errors=${errors}`;
    throw new Error("abort");
  }
  return data;
}

async function submitNewsletter(baseURL, el) {
  // Fetch token from the API
  let tokenData = await fetchOrRedirect(`${baseURL}/api/token`);
  let token = tokenData.data;

  // Submit form as JSON with token
  let formData = new FormData(el);
  let obj = Object.fromEntries(formData.entries());
  obj.token = token;

  let resp = await fetchOrRedirect(`${baseURL}/api/verify-subscribe`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(obj),
  });

  for (let msg of resp.data) {
    await fetchOrRedirect(`${baseURL}/api/list-add`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(msg),
    });
  }

  // Redirect to thanks page on successful submission
  window.top.location.href = "/newsletters/thanks/";
}

function newsletter(baseURL) {
  return {
    isLoading: false,
    hasFocused: false,
    submit() {
      this.isLoading = true;
      submitNewsletter(baseURL, this.$el)
        .catch((e) => {
          // eslint-disable-next-line no-console
          console.warn(e);
        })
        .finally(() => {
          this.isLoading = false;
        });
    },
  };
}

export default function newsletterPlugin(Alpine) {
  Alpine.data("newsletter", newsletter);
}
