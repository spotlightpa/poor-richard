import { each } from "../utils/dom-utils.js";
import { reportClick as analytics } from "../utils/google-analytics.js";

export default function emailPreferences() {
  return {
    analytics,
    isLoading: false,
    didLoad: false,
    baseURL: "https://email-alerts.data.spotlightpa.org",
    email: "",
    firstName: "",
    lastName: "",
    unsubscribed: "",
    userID: "",
    fipsEls: [],
    error: null,
    hasSaved: false,

    init() {
      if (this.$el.dataset.baseUrl) {
        this.baseURL = this.$el.dataset.baseUrl;
      }
      this.fipsEls = this.$refs.counties.querySelectorAll("[name=fips]");
      let email = new URLSearchParams(window.location.search).get("email");
      if (email) {
        this.email = email;
        this.load();
      }
    },
    get canLoad() {
      return !this.isLoading && this.email && this.$refs.email.checkValidity();
    },
    load() {
      if (!this.canLoad) return;

      this.isLoading = true;
      let url = this.baseURL + "/api/list-subscriptions/" + btoa(this.email);
      fetch(url)
        .then((rsp) => {
          if (rsp.status === 404) {
            let err = new Error(
              `Email address not found. Are you sure you subscribed with ${this.email}?`
            );
            err.name = "Not Found";
            throw err;
          }
          if (!rsp.ok) {
            let err = new Error(
              `Unexpected response: ${rsp.status} ${rsp.statusText}`
            );
            err.name = "Request error";
            throw err;
          }
          return rsp.json();
        })
        .then((data) => {
          this.loadData(data);
          this.didLoad = true;
        })
        .catch((err) => {
          this.error = err;
        })
        .finally(() => {
          this.isLoading = false;
        });
    },

    loadData(data) {
      this.userID = data["id"] ?? "";
      this.email = data["email"] ?? "";
      this.firstName = data["first_name"] ?? "";
      this.lastName = data["last_name"] ?? "";
      this.unsubscribed = data["unsubscribed"] ?? false;
      let fipsCodes = new Set(data.fips_codes);
      each(this.fipsEls, (el) => {
        el.checked = fipsCodes.has(el.value);
      });
    },

    save() {
      this.isLoading = true;
      let data = {
        id: this.userID,
        email: this.email,
        first_name: this.firstName,
        last_name: this.lastName,
        unsubscribed: this.unsubscribed,
        fips_codes: [],
      };
      each(this.fipsEls, (el) => {
        if (el.checked) {
          data.fips_codes.push(el.value);
        }
      });

      let url = this.baseURL + "/api/update-subscriptions";
      fetch(url, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(data),
      })
        .then((rsp) => {
          if (!rsp.ok) {
            let err = new Error(
              `Unexpected response: ${rsp.status} ${rsp.statusText}`
            );
            err.name = "Request error";
            throw err;
          }
          return rsp.json();
        })
        .then(() => {
          this.hasSaved = true;
          window.setTimeout(() => {
            this.hasSaved = false;
          }, 5000);
        })
        .catch((err) => {
          this.error = err;
        })
        .finally(() => {
          this.isLoading = false;
        });
    },

    unselect() {
      each(this.fipsEls, (el) => {
        el.checked = false;
      });
    },
  };
}
