import Alpine from "alpinejs/src/index.js";
import {
  cityOptionsFromList,
  filterDropdownOptions,
  normalizeString,
} from "../utils/inspections.js";

export function inspectionMobileFilters() {
  return {
    filtersOpen: false,

    openFilters() {
      this.filtersOpen = true;
    },

    closeFilters() {
      this.filtersOpen = false;
    },

    clearAll() {
      const store = Alpine.store("inspections");
      store.searchQuery = "";
      store.currentCity = "";
      store.currentSort = "date-desc";
      localStorage.removeItem("inspections-sort");
      this.filtersOpen = false;
    },
  };
}

export function inspectionCityFilter({
  labelPrefix = "",
  emptyLabel = "All Cities",
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
    },

    clear() {
      this.store.currentCity = "";
      this.open = false;
      this.query = "";
      this.syncShown();
    },
  };
}

export function inspectionSortMenu({
  labelPrefix = "Sort: ",
  defaultValue = "date-desc",
  options = [
    {
      value: "date-desc",
      shortLabel: "Date",
      longLabel: "Inspection Date - Newest to Oldest",
    },
    {
      value: "risk-desc",
      shortLabel: "Risk",
      longLabel: "Violation Risk - Highest to Lowest",
    },
    {
      value: "alpha-asc",
      shortLabel: "Name",
      longLabel: "Facility Name - A to Z",
    },
  ],
} = {}) {
  return {
    open: false,
    options,
    labelPrefix,
    defaultValue,

    get store() {
      return Alpine.store("inspections");
    },

    get selected() {
      return this.store.currentSort || this.defaultValue;
    },

    get label() {
      const current =
        this.options.find((opt) => opt.value === this.selected) ||
        this.options[0];
      return `${this.labelPrefix}${current?.shortLabel || "Date"}`;
    },

    init() {
      if (!this.store.currentSort) {
        this.store.currentSort =
          localStorage.getItem("inspections-sort") || this.defaultValue;
      }
    },

    choose(value) {
      this.store.currentSort = value;
      localStorage.setItem("inspections-sort", value);
      this.open = false;
    },
  };
}
