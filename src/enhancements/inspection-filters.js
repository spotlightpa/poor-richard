import Alpine from "alpinejs/src/index.js";
import {
  cityOptionsFromList,
  filterDropdownOptions,
  normalizeString,
} from "../utils/inspections.js";

export function inspectionCityFilter({
  labelPrefix = "",
  emptyLabel = "All cities",
  limit = 20,
} = {}) {
  return {
    open: false,
    query: "",
    optionsAll: [],
    optionsShown: [],
    limit,
    labelPrefix,
    emptyLabel,

    get store() {
      return Alpine.store("inspections");
    },

    get selectedValue() {
      return this.store.currentCity || "";
    },

    get selectedText() {
      if (!this.selectedValue) return this.emptyLabel;

      const selected = this.optionsAll.find((opt) => {
        return (
          normalizeString(opt.value) === normalizeString(this.selectedValue) ||
          normalizeString(opt.text) === normalizeString(this.selectedValue)
        );
      });

      return selected ? selected.text : this.selectedValue;
    },

    get label() {
      const value = this.selectedText || this.emptyLabel;
      return this.labelPrefix ? `${this.labelPrefix}${value}` : value;
    },

    init() {
      this.refreshOptions(this.store.cities);

      window.addEventListener("inspections-cities-ready", (e) => {
        this.refreshOptions(e.detail?.cities || []);
      });

      this.$watch("$store.inspections.currentCity", () => {
        if (!this.open) this.query = "";
      });
    },

    refreshOptions(list) {
      this.optionsAll = cityOptionsFromList(list);
      this.syncShown();
    },

    syncShown() {
      this.optionsShown = filterDropdownOptions(
        this.optionsAll,
        this.query,
        this.limit,
      );
    },

    choose(value) {
      this.store.currentCity = (value || "").trim();
      this.open = false;
      this.query = "";
      this.syncShown();
      this.$nextTick(() => this.$refs.cityClear?.focus());
    },

    clear() {
      this.store.currentCity = "";
      this.open = false;
      this.query = "";
      this.syncShown();
      this.$nextTick(() => this.$refs.cityInput?.focus());
    },
  };
}
