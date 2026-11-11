export default function netlifyForm() {
  return {
    isLoading: false,
    done: false,

    submit(form) {
      this.isLoading = true;
      fetch("/", {
        method: "POST",
        headers: { "Content-Type": "application/x-www-form-urlencoded" },
        body: new URLSearchParams(new FormData(form)).toString(),
      })
        .then((rsp) => {
          if (!rsp.ok) {
            throw new Error(rsp.statusText);
          }
          this.done = true;
        })
        .catch(() => {
          form.submit();
        })
        .finally(() => {
          this.isLoading = false;
        });
    },
  };
}
