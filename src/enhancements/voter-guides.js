import { NewsletterError, submitNewsletter } from "./newsletter.js";

const STORAGE_KEY = "spl-voter-guides-email";

function readStorage() {
  try {
    return window.localStorage.getItem(STORAGE_KEY);
  } catch {
    return null;
  }
}

function writeStorage(value) {
  try {
    if (value) {
      window.localStorage.setItem(STORAGE_KEY, value);
    } else {
      window.localStorage.removeItem(STORAGE_KEY);
    }
  } catch {
    return;
  }
}

export default function voterGuides(baseURL) {
  return {
    email: "",
    error: "",
    unlocked: false,
    isLoading: false,

    init() {
      let saved = readStorage();
      if (saved) {
        this.email = saved;
        this.unlocked = true;
      }
    },

    submit(form) {
      if (!form.checkValidity()) {
        this.error = "Please enter a valid email address.";
        return;
      }
      this.error = "";
      this.isLoading = true;
      submitNewsletter(baseURL, form, { redirect: false })
        .then(() => {
          writeStorage(this.email.trim());
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
      writeStorage(null);
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
