export default function shareButton() {
  return {
    ["x-show"]() {
      return !!navigator.share;
    },
    ["@click"]() {
      let title =
        this.$el.dataset.shareTitle ??
        document.querySelector("[itemprop='name']")?.content ??
        document.title;
      let text =
        this.$el.dataset.shareText ??
        document.querySelector("[itemprop='description']")?.content ??
        "";
      let url = this.$el.dataset.shareUrl ?? window.location.href;
      navigator
        .share({
          title,
          text,
          url,
        })
        // Ignore errors caused by closing sheet
        .catch(() => null);
    },
  };
}
