import { normalizeString } from "../utils/inspections.js";

export default function inspectionsModal() {
  return {
    open: false,
    mode: "facility",
    facilityName: "",
    facilityId: "",
    step: "form",
    email: "",
    phone: "",
    method: "email",
    rememberMe: false,
    submitting: false,
    errorMessage: "",
    citySubscribeSummary: null,
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
        this.userCity = "";
        this.cityFacilities = [];
        this.selectedFacilities = {};
        this.facilitiesOpen = false;
        this.detectingCity = true;
        this.cityNotFound = false;
        this.citySearchQuery = "";
        this.cityDropdownOpen = false;
        document.body.style.overflow = "hidden";
        this.$nextTick(() => this.detectCity());
      });
    },

    closeModal() {
      this.open = false;
      document.body.style.overflow = "";
    },

    async detectCity() {
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

        const match = this.matchCity(detected);
        if (match) {
          this.userCity = match;
          this.cityNotFound = false;
          this.loadCityFacilities(match);
        } else {
          this.cityNotFound = true;
        }
      } catch {
        this.cityNotFound = true;
      } finally {
        this.detectingCity = false;
      }
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

    loadCityFacilities(city) {
      const allData = window.__inspectionsAllData || [];
      const nc = normalizeString(city);
      const grouped = {};
      allData.forEach((row) => {
        if (normalizeString(row.city || "") !== nc) return;
        const id = row.id || `${row.facility}—${row.address}`;
        if (!grouped[id])
          grouped[id] = { id, name: row.facility || "Unknown facility" };
      });
      this.cityFacilities = Object.values(grouped).sort((a, b) =>
        a.name.localeCompare(b.name),
      );
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
              };

        if (this.mode === "city") {
          const ids = Object.entries(this.selectedFacilities)
            .filter(([, v]) => v)
            .map(([k]) => k);

          let newCount = 0;
          let alreadyCount = 0;
          let errorCount = 0;
          let newFacilityName = "";

          await Promise.all(
            ids.map(async (id) => {
              try {
                const r = await fetch("/.netlify/functions/subscribe", {
                  method: "POST",
                  headers: { "Content-Type": "application/json" },
                  body: JSON.stringify({
                    ...payload,
                    facilityId: id,
                    skipSms: true,
                    skipEmail: true,
                  }),
                });
                const d = await r.json();
                if (r.status === 409 && d.alreadySubscribed) {
                  alreadyCount++;
                } else if (r.ok) {
                  newCount++;
                  if (!newFacilityName) {
                    const match = this.cityFacilities.find((f) => f.id === id);
                    if (match) newFacilityName = match.name;
                  }
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

          this.citySubscribeSummary = {
            newCount,
            alreadyCount,
            newFacilityName,
          };

          if (newCount > 0) {
            try {
              await fetch("/.netlify/functions/subscribe", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                  email: this.email,
                  phone: this.phone,
                  city: this.userCity,
                  newCount,
                  newFacilityName,
                  summarySms: true,
                }),
              });
            } catch {
              // non-fatal
            }
          }
          this.step = "success";
        } else {
          const res = await fetch("/.netlify/functions/subscribe", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(payload),
          });
          const data = await res.json();
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
