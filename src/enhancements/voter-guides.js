import { NewsletterError, submitNewsletter } from "./newsletter.js";
import {
  funnelStatus,
  statusSubscriber,
  recordNewsletterSignup,
} from "../utils/metrics.js";

export default function voterGuides(baseURL) {
  return {
    email: "",
    error: "",
    unlocked: funnelStatus >= statusSubscriber,
    isLoading: false,

    submit(form) {
      if (!form.checkValidity()) {
        this.error = "Please enter a valid email address.";
        return;
      }
      this.error = "";
      this.isLoading = true;
      submitNewsletter(baseURL, form, { redirect: false })
        .then(() => {
          recordNewsletterSignup();
          this.unlocked = true;
        })
        .catch((e) => {
          this.error =
            e instanceof NewsletterError && e.code && e.message
              ? e.message
              : "Something went wrong. Please try again.";
          this.$nextTick(() => this.$refs.email?.focus());
        })
        .finally(() => {
          this.isLoading = false;
        });
    },

    reset() {
      this.email = "";
      this.unlocked = false;
      this.$nextTick(() => this.$refs.email?.focus());
    },

    guard(event) {
      if (this.unlocked) {
        return;
      }
      event.preventDefault();
      this.error = "Enter your email address to download.";
      this.$refs.email?.scrollIntoView({ behavior: "smooth", block: "center" });
      this.$refs.email?.focus({ preventScroll: true });
    },
  };
}
