import {
  normalizeString,
  generateFacilitySlug,
  generateInspectionCardId,
  simplifyAddress,
} from "../utils/inspections.js";
import { buildCityList } from "./inspections-data.js";
import { markAdded, rememberedContact } from "../utils/quick-alerts.js";

let facilitySearchIndex = [];

function buildFacilitySearchIndex(allData) {
  const seen = new Set();
  const index = [];
  allData.forEach((row) => {
    const rawId = row.id || `${row.facility} — ${row.address}`;
    const id = generateInspectionCardId(rawId);
    if (!id || seen.has(id)) return;
    seen.add(id);
    const address = simplifyAddress(row.address || "") || row.city || "";
    index.push({
      id,
      name: row.facility || "Facility",
      address,
      searchText: normalizeString(
        [row.facility, row.address, row.city].filter(Boolean).join(" "),
      ),
    });
  });
  return index.sort((a, b) => a.name.localeCompare(b.name));
}

export default function inspectionsModal({ page = false } = {}) {
  const saved = rememberedContact();
  return {
    page,
    dataReady: false,
    facilitySearchQuery: "",
    facilityDropdownOpen: false,
    open: page,
    mode: "facility",
    facilityName: "",
    facilityAddress: "",
    facilityId: "",
    step: "form",
    email: saved?.email || "",
    phone: saved?.phone || "",
    method: "email",
    rememberMe: !!saved,
    submitting: false,
    errorMessage: "",
    citySubscribeSummary: null,
    restaurants: [],
    cities: [],
    locatingCity: false,
    locateError: "",
    userCity: "",
    cityFacilities: [],
    selectedFacilities: {},
    facilitiesOpen: false,
    detectingCity: false,
    cityNotFound: false,
    citySearchQuery: "",
    cityDropdownOpen: false,

    get selectedCount() {
      return Object.values(this.selectedFacilities).filter(Boolean).length;
    },

    get facilityResults() {
      const q = normalizeString(this.facilitySearchQuery);
      if (q.length < 2) return [];
      const terms = q.split(" ");
      const results = [];
      for (const f of facilitySearchIndex) {
        if (terms.every((t) => f.searchText.includes(t))) {
          results.push({ id: f.id, name: f.name, address: f.address });
          if (results.length >= 30) break;
        }
      }
      return results;
    },

    get filteredCities() {
      const q = (this.citySearchQuery || "").toLowerCase().trim();
      const all = window.__inspectionsCities || [];
      if (!q) return all.slice(0, 30);
      return all
        .filter((c) => (c.text || "").toLowerCase().includes(q))
        .slice(0, 30);
    },

    init() {
      window.addEventListener("open-alerts-modal", (e) => {
        this.open = true;
        this.mode = "facility";
        this.facilityName = e.detail.facilityName;
        this.facilityAddress = e.detail.facilityAddress || "";
        this.facilityId = e.detail.facilityId;
        this.step = "form";
        this.email = localStorage.getItem("alerts-remembered-email") || "";
        this.phone = localStorage.getItem("alerts-remembered-phone") || "";
        this.rememberMe = !!(this.email || this.phone);
        this.submitting = false;
        this.errorMessage = "";
        this.citySubscribeSummary = null;
        document.body.style.overflow = "hidden";
      });

      window.addEventListener("open-city-alerts-modal", () => {
        this.open = true;
        this.mode = "city";
        this.step = "form";
        this.email = localStorage.getItem("alerts-remembered-email") || "";
        this.phone = localStorage.getItem("alerts-remembered-phone") || "";
        this.rememberMe = !!(this.email || this.phone);
        this.submitting = false;
        this.errorMessage = "";
        this.citySubscribeSummary = null;
        this.resetCity();
        document.body.style.overflow = "hidden";
        this.$nextTick(() => this.detectCity());
      });

      if (this.page) this.initPage();
    },

    initPage() {
      this.mode = "facility";
      this.step = "form";
      this.email = localStorage.getItem("alerts-remembered-email") || "";
      this.phone = localStorage.getItem("alerts-remembered-phone") || "";
      this.rememberMe = !!(this.email || this.phone);

      const params = new URLSearchParams(window.location.search);
      const requestedFacility = params.get("facility") || "";
      const requestedCity = params.get("city") || "";
      if (requestedCity && !requestedFacility) this.mode = "city";

      const onData = (data) => {
        if (this.dataReady) return;
        window.__inspectionsAllData = data;
        window.__inspectionsCities = buildCityList(data);
        facilitySearchIndex = buildFacilitySearchIndex(data);
        this.dataReady = true;

        if (requestedFacility) {
          const match = facilitySearchIndex.find(
            (f) => f.id === requestedFacility,
          );
          if (match) this.addRestaurant(match);
        }
        if (this.mode === "city") {
          requestedCity.split(",").forEach((c) => {
            const city = c.trim() ? this.matchCity(c.trim()) : null;
            if (city) this.addCity(city);
          });
        }
      };

      if (window.__inspectionsAllData?.length) {
        onData(window.__inspectionsAllData);
      } else {
        window.addEventListener(
          "inspections-data-ready",
          (e) => onData(e.detail?.data || []),
          { once: true },
        );
      }
    },

    resetCity() {
      this.userCity = "";
      this.cityFacilities = [];
      this.selectedFacilities = {};
      this.facilitiesOpen = false;
      this.detectingCity = true;
      this.cityNotFound = false;
      this.citySearchQuery = "";
      this.cityDropdownOpen = false;
    },

    startCityDetection() {
      this.resetCity();
      this.$nextTick(() => this.detectCity());
    },

    switchMode(mode) {
      if (this.mode === mode) return;
      this.mode = mode;
      this.errorMessage = "";
      if (mode === "city" && this.dataReady && !this.userCity && !this.page) {
        this.startCityDetection();
      }
    },

    addRestaurant(f) {
      if (!this.restaurants.some((r) => r.id === f.id)) {
        this.restaurants.push({ id: f.id, name: f.name, address: f.address });
      }
      this.facilitySearchQuery = "";
      this.facilityDropdownOpen = false;
      this.errorMessage = "";
      this.$nextTick(() =>
        document.getElementById("alert-facility-search")?.focus(),
      );
    },

    addCity(name) {
      if (!this.cities.some((c) => c.name === name)) {
        this.cities.push({ name, count: this.facilitiesForCity(name).length });
      }
      this.citySearchQuery = "";
      this.cityDropdownOpen = false;
      this.locateError = "";
      this.errorMessage = "";
    },

    removeCity(name) {
      this.cities = this.cities.filter((c) => c.name !== name);
    },

    isCityAdded(name) {
      return this.cities.some((c) => c.name === name);
    },

    resetCities() {
      this.cities = [];
      this.userCity = "";
      this.citySubscribeSummary = null;
      this.citySearchQuery = "";
    },

    get citiesLabel() {
      const names = this.cities.map((c) => c.name);
      if (names.length <= 2) return names.join(" and ");
      return `${names.slice(0, -1).join(", ")} and ${names[names.length - 1]}`;
    },

    async addMyCity() {
      this.locatingCity = true;
      this.locateError = "";
      const match = await this.geolocateCity();
      this.locatingCity = false;
      if (match) {
        this.addCity(match);
      } else {
        this.locateError =
          "We couldn't find your city. Search for it above instead.";
      }
    },

    removeRestaurant(id) {
      this.restaurants = this.restaurants.filter((r) => r.id !== id);
    },

    isRestaurantAdded(id) {
      return this.restaurants.some((r) => r.id === id);
    },

    resetRestaurants() {
      this.restaurants = [];
      this.citySubscribeSummary = null;
      this.clearFacility();
    },

    async subscribeMany(items, payload) {
      let newCount = 0;
      let alreadyCount = 0;
      let errorCount = 0;
      let newFacilityName = "";

      await Promise.all(
        items.map(async (item) => {
          try {
            const r = await fetch("/.netlify/functions/subscribe", {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({
                ...payload,
                facilityId: item.id,
                facilityName: item.facilityName,
                facilityAddress: item.facilityAddress,
                skipSms: true,
                skipEmail: true,
              }),
            });
            const d = await r.json().catch(() => ({}));
            if (r.status === 409 && d.alreadySubscribed) {
              alreadyCount++;
            } else if (r.ok) {
              newCount++;
              if (!newFacilityName) newFacilityName = item.displayName;
            } else {
              errorCount++;
            }
          } catch {
            errorCount++;
          }
        }),
      );

      if (errorCount > 0 && newCount === 0 && alreadyCount === 0) {
        throw new Error("Something went wrong. Please try again.");
      }

      this.citySubscribeSummary = { newCount, alreadyCount, newFacilityName };

      if (newCount > 0) {
        try {
          await fetch("/.netlify/functions/subscribe", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              email: this.email,
              phone: this.phone,
              city: payload.city || "",
              newCount,
              newFacilityName,
              summarySms: true,
            }),
          });
        } catch {
          return;
        }
      }
    },

    clearFacility() {
      this.facilityId = "";
      this.facilityName = "";
      this.facilityAddress = "";
      this.facilitySearchQuery = "";
      this.errorMessage = "";
      this.$nextTick(() =>
        document.getElementById("alert-facility-search")?.focus(),
      );
    },

    closeModal() {
      if (this.page) return;
      this.open = false;
      document.body.style.overflow = "";
    },

    async geolocateCity() {
      try {
        const pos = await new Promise((resolve, reject) =>
          navigator.geolocation.getCurrentPosition(resolve, reject, {
            timeout: 8000,
          }),
        );
        const { latitude, longitude } = pos.coords;
        const res = await fetch(
          `https://viz-sample-ballot-2024.data.spotlightpa.org/api/geolocate?latlng=${encodeURIComponent(latitude)},${encodeURIComponent(longitude)}`,
        );
        const data = await res.json();
        const results =
          data.status === "OK" && data.results ? data.results : [];
        const components = results[0]?.address_components || [];

        let detected = "";
        for (const c of components) {
          if (c.types.includes("locality")) {
            detected = c.long_name;
            break;
          }
        }
        if (!detected) {
          for (const c of components) {
            if (
              c.types.includes("sublocality") ||
              c.types.includes("administrative_area_level_3")
            ) {
              detected = c.long_name;
              break;
            }
          }
        }
        return detected ? this.matchCity(detected) : null;
      } catch {
        return null;
      }
    },

    async detectCity() {
      const match = await this.geolocateCity();
      if (match) {
        this.userCity = match;
        this.cityNotFound = false;
        this.loadCityFacilities(match);
      } else {
        this.cityNotFound = true;
      }
      this.detectingCity = false;
    },

    matchCity(detected) {
      const nd = normalizeString(detected);
      const cities = window.__inspectionsCities || [];
      const exact = cities.find(
        (c) =>
          normalizeString(c.value) === nd || normalizeString(c.text) === nd,
      );
      if (exact) return exact.text;
      const partial = cities.find(
        (c) =>
          normalizeString(c.text).includes(nd) ||
          nd.includes(normalizeString(c.text)),
      );
      return partial ? partial.text : null;
    },

    selectCity(cityText) {
      this.userCity = cityText;
      this.cityNotFound = false;
      this.cityDropdownOpen = false;
      this.citySearchQuery = "";
      this.loadCityFacilities(cityText);
    },

    facilitiesForCity(city) {
      const allData = window.__inspectionsAllData || [];
      const nc = normalizeString(city);
      const grouped = {};
      allData.forEach((row) => {
        if (normalizeString(row.city || "") !== nc) return;
        const id = generateFacilitySlug(row.facility || "", row.address || "");
        if (!id) return;
        if (!grouped[id])
          grouped[id] = {
            id,
            name: row.facility || "Unknown facility",
            facilityName: row.facility || "Unknown facility",
            facilityAddress: row.address || "",
          };
      });
      return Object.values(grouped).sort((a, b) =>
        a.name.localeCompare(b.name),
      );
    },

    loadCityFacilities(city) {
      this.cityFacilities = this.facilitiesForCity(city);
      const sel = {};
      this.cityFacilities.forEach((f) => {
        sel[f.id] = true;
      });
      this.selectedFacilities = sel;
    },

    toggleFacility(id) {
      this.selectedFacilities[id] = !this.selectedFacilities[id];
    },

    toggleAllFacilities(checked) {
      const updated = {};
      this.cityFacilities.forEach((f) => {
        updated[f.id] = checked;
      });
      this.selectedFacilities = updated;
    },

    async submitSignup() {
      if (!this.email && !this.phone) {
        alert("Please provide an email address or phone number.");
        return;
      }
      this.submitting = true;

      if (this.rememberMe) {
        if (this.email)
          localStorage.setItem("alerts-remembered-email", this.email);
        else localStorage.removeItem("alerts-remembered-email");
        if (this.phone)
          localStorage.setItem("alerts-remembered-phone", this.phone);
        else localStorage.removeItem("alerts-remembered-phone");
      } else {
        localStorage.removeItem("alerts-remembered-email");
        localStorage.removeItem("alerts-remembered-phone");
      }

      if (this.page && this.mode === "facility") {
        this.citySubscribeSummary = null;
        if (this.restaurants.length === 1) {
          const [only] = this.restaurants;
          this.facilityId = only.id;
          this.facilityName = only.name;
          this.facilityAddress = only.address;
        }
      }

      try {
        const payload =
          this.mode === "city"
            ? {
                email: this.email,
                phone: this.phone,
                method: this.method,
                city: this.userCity,
              }
            : {
                email: this.email,
                phone: this.phone,
                method: this.method,
                facilityId: this.facilityId,
                facilityName: this.facilityName,
                facilityAddress: this.facilityAddress,
              };

        if (this.mode === "city" && this.page) {
          this.userCity = this.citiesLabel;
          const seen = new Set();
          const items = [];
          this.cities.forEach((c) => {
            this.facilitiesForCity(c.name).forEach((f) => {
              if (seen.has(f.id)) return;
              seen.add(f.id);
              items.push({
                id: f.id,
                facilityName: f.facilityName,
                facilityAddress: f.facilityAddress,
                displayName: f.name,
              });
            });
          });
          await this.subscribeMany(items, { ...payload, city: this.userCity });
          this.step = "success";
        } else if (this.mode === "city") {
          const items = Object.entries(this.selectedFacilities)
            .filter(([, v]) => v)
            .map(([id]) => {
              const m = this.cityFacilities.find((f) => f.id === id);
              return {
                id,
                facilityName: m ? m.facilityName : id,
                facilityAddress: m?.facilityAddress || "",
                displayName: m ? m.name : "",
              };
            });
          await this.subscribeMany(items, payload);
          this.step = "success";
        } else if (this.page && this.restaurants.length > 1) {
          const items = this.restaurants.map((r) => ({
            id: r.id,
            facilityName: r.name,
            facilityAddress: r.address,
            displayName: r.name,
          }));
          await this.subscribeMany(items, payload);
          this.step = "success";
        } else {
          const res = await fetch("/.netlify/functions/subscribe", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(payload),
          });
          const data = await res.json().catch(() => ({}));
          if (res.status === 409 && data.alreadySubscribed) {
            throw new Error(
              `You're already subscribed to alerts for ${this.facilityName}.`,
            );
          }
          if (!res.ok) {
            throw new Error(
              data.error || "Something went wrong. Please try again.",
            );
          }
          if (this.rememberMe) markAdded(this.facilityId, data.undoToken);
          this.step = "success";
        }
      } catch (err) {
        this.errorMessage = err.message;
      } finally {
        this.submitting = false;
      }
    },
  };
}
