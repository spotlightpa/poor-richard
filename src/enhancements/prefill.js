export default function prefill() {
  return {
    buildClass(cs, val) {
      return Object.fromEntries(cs.split(/ /).map((c) => [c, val]));
    },
    init() {
      this.activeClasses = {
        ...this.buildClass(this.$el.dataset.active, true),
        ...this.buildClass(this.$el.dataset.inactive, false),
      };
      this.inactiveClasses = {
        ...this.buildClass(this.$el.dataset.active, false),
        ...this.buildClass(this.$el.dataset.inactive, true),
      };
    },
    amount: "15",
    freq: "m",
    showOther: false,
    btnClass(cond) {
      return cond ? this.activeClasses : this.inactiveClasses;
    },
    setAmt(freq, amount) {
      this.freq = freq;
      this.amount = amount;
      this.showOther = false;
    },
    get donateURL() {
      let campaign =
        this.$el.closest("[data-sf-campaign]")?.dataset.sfCampaign ||
        "701Dn000000YgouIAC";
      let theme = this.$el.closest("[data-sf-theme]")?.dataset.sfTheme || "";
      let period = {
        o: "once",
        m: "monthly",
        y: "yearly",
      }[this.freq];
      return `https://spotlightpa.fundjournalism.org/${theme}?campaign=${campaign}&&amount=${this.amount}&frequency=${period}&utm_source=spotlightpa.org&utm_campaign=donate-prefill`;
    },
  };
}
