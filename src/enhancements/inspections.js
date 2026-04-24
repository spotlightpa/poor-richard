import Alpine from "alpinejs/src/index.js";
import { escapeHTML, parseInspectionDate } from "../utils/inspections.js";

export function searchUI() {
  return {
    loadingLocation: false,

    get q() {
      return Alpine.store("inspections").searchQuery;
    },
    set q(val) {
      Alpine.store("inspections").searchQuery = val;
    },

    init() {},

    doSearch(val) {
      if (typeof val === "string") this.q = val;
    },

    async locate() {
      if (!("geolocation" in navigator)) {
        alert("Geolocation isn't supported in this browser.");
        return;
      }
      this.loadingLocation = true;
      navigator.geolocation.getCurrentPosition(
        async (pos) => {
          try {
            const { latitude: lat, longitude: lon } = pos.coords;
            const res = await fetch(
              `https://viz-sample-ballot-2024.data.spotlightpa.org/api/geolocate?latlng=${encodeURIComponent(lat)},${encodeURIComponent(lon)}`,
            );
            if (!res.ok) throw new Error("Reverse geocode failed");
            const data = await res.json();
            if (data.status !== "OK" || !data.results?.length)
              throw new Error("No results");
            const components = data.results[0].address_components || [];
            let city = "",
              zip = "",
              state = "";
            for (const c of components) {
              if (!city && c.types.includes("locality")) city = c.long_name;
              if (!zip && c.types.includes("postal_code")) zip = c.short_name;
              if (!state && c.types.includes("administrative_area_level_1"))
                state = c.short_name;
            }
            if (!city) {
              for (const c of components) {
                if (
                  c.types.includes("sublocality") ||
                  c.types.includes("administrative_area_level_3")
                ) {
                  city = c.long_name;
                  break;
                }
              }
            }
            if (state !== "PA") {
              alert(
                "This tool covers Pennsylvania only. Your location appears to be outside PA.",
              );
              this.loadingLocation = false;
              return;
            }
            const locationString = [city.trim(), zip.trim()]
              .filter(Boolean)
              .join(" ");
            if (locationString) {
              Alpine.store("inspections").searchQuery = locationString;
              if (this.$refs?.input) this.$refs.input.value = locationString;
            } else {
              alert("Couldn't determine your city/ZIP from location.");
            }
          } catch (e) {
            // eslint-disable-next-line no-console
            console.error(e);
            alert("Sorry, we couldn't look up your city/ZIP.");
          } finally {
            this.loadingLocation = false;
          }
        },
        (err) => {
          // eslint-disable-next-line no-console
          console.warn(err);
          if (err.code === err.PERMISSION_DENIED) {
            alert("We need permission to use your location.");
          } else if (err.code === err.POSITION_UNAVAILABLE) {
            alert("Location unavailable. Try again.");
          } else if (err.code === err.TIMEOUT) {
            alert("Timed out getting your location. Try again.");
          } else {
            alert("Couldn't get your location. Please try again.");
          }
          this.loadingLocation = false;
        },
        { enableHighAccuracy: false, maximumAge: 60000, timeout: 10000 },
      );
    },
  };
}

let inspectionsUIDelegatesInitialized = false;
let inspectionsUIResizeInitialized = false;
let inspectionsUIDataReadyInitialized = false;

export default function inspectionsUI() {
  return {
    activeCard: null,
    lastReadMoreButton: null,
    initializedDelegates: false,

    get store() {
      return Alpine.store("inspections");
    },

    get currentSort() {
      return this.store.currentSort;
    },
    set currentSort(val) {
      this.store.currentSort = val;
    },

    get currentCity() {
      return this.store.currentCity;
    },
    set currentCity(val) {
      this.store.currentCity = val;
    },

    get searchQuery() {
      return this.store.searchQuery;
    },
    set searchQuery(val) {
      this.store.searchQuery = val;
    },

    get totalResults() {
      return this.store.filteredData.length;
    },

    get hasResults() {
      return this.store.filteredData.length > 0;
    },

    init() {
      if (!inspectionsUIDelegatesInitialized) {
        document.addEventListener("click", (e) => {
          const readMoreBtn = e.target.closest(
            'button[aria-label="Read more about this inspection"]',
          );
          if (readMoreBtn) {
            e.preventDefault();
            const card = readMoreBtn.closest('[data-card="inspection"]');
            if (card) {
              this.lastReadMoreButton = readMoreBtn;
              this.openDetails(card);
            }
            return;
          }
          const backBtn = e.target.closest('[data-action="back-to-results"]');
          if (backBtn) {
            e.preventDefault();
            this.backToResults();
            return;
          }
        });
        inspectionsUIDelegatesInitialized = true;
      }

      if (!inspectionsUIResizeInitialized) {
        inspectionsUIResizeInitialized = true;

        let resizeTimer;
        let lastWidth = window.innerWidth;
        window.addEventListener("resize", () => {
          clearTimeout(resizeTimer);
          resizeTimer = setTimeout(() => {
            const currentWidth = window.innerWidth;
            const wasMobile = lastWidth < 768;
            const wasDesktop = lastWidth >= 768;
            const isDesktop = currentWidth >= 768;
            if ((wasMobile && isDesktop) || (wasDesktop && !isDesktop)) {
              const hash = window.location.hash.slice(1);
              document
                .querySelectorAll(".mobile-detail-view")
                .forEach((el) => el.remove());
              document
                .querySelectorAll(".detail-content")
                .forEach((el) => el.remove());
              document
                .querySelectorAll(".pagination-controls")
                .forEach((el) => el.classList.remove("hidden"));
              document
                .querySelectorAll('[data-card="inspection"]')
                .forEach((card) => {
                  card.style.display = "";
                  card.classList.remove(
                    "hidden-by-detail",
                    "h-full",
                    "flex",
                    "flex-col",
                    "flex-1",
                  );
                  card.classList.add("space-y-3");
                  card
                    .querySelector(".list-content")
                    ?.classList.remove("hidden");
                  const mount = card.closest(".inspections-mount");
                  if (mount) {
                    mount.classList.remove("h-full", "flex", "flex-col");
                    mount.classList.add("space-y-3");
                  }
                });
              this.activeCard = null;
              if (hash) {
                setTimeout(() => {
                  const cards = document.querySelectorAll(
                    '[data-card="inspection"]',
                  );
                  for (const card of cards) {
                    if (this.generateCardId(card) === hash) {
                      if (isDesktop) this.openDetails(card);
                      // eslint-disable-next-line no-undef
                      else openMobileCardDetails(card);
                      break;
                    }
                  }
                }, 100);
              }
            }
            lastWidth = currentWidth;
          }, 250);
        });
      }

      if (!inspectionsUIDataReadyInitialized) {
        inspectionsUIDataReadyInitialized = true;
        window.addEventListener("inspections-data-ready", () => {
          setTimeout(() => this.checkHashAndOpenCard(), 200);
        });
      }
    },

    clearAll() {
      this.store.searchQuery = "";
      this.store.currentCity = "";
      this.store.currentSort = "date-desc";
      localStorage.removeItem("inspections-sort");
      if (this.$refs?.searchInput) this.$refs.searchInput.value = "";
    },

    generateCardId(card) {
      const title = (card.querySelector("h2")?.textContent || "").trim();
      return title
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, "-")
        .replace(/^-+|-+$/g, "");
    },

    checkHashAndOpenCard() {
      if (window.innerWidth < 768) return;
      const hash = window.location.hash.slice(1);
      if (!hash) return;
      const cards = Array.from(
        document.querySelectorAll('[data-card="inspection"]'),
      );
      const card = cards.find((c) => this.generateCardId(c) === hash);
      if (card) setTimeout(() => this.openDetails(card), 200);
    },

    jsStringAttr(s) {
      return JSON.stringify(String(s ?? "")).replace(/"/g, "&quot;");
    },

    openDetails(card) {
      document
        .querySelectorAll(".pagination-controls")
        .forEach((el) => el.classList.add("hidden"));
      document.getElementById("search-results-banner")?.classList.add("hidden");

      const lat = parseFloat(card.getAttribute("data-lat"));
      const lon = parseFloat(card.getAttribute("data-lon"));
      if (!isNaN(lat) && !isNaN(lon)) {
        window.dispatchEvent(
          new CustomEvent("map:zoomToMarker", { detail: { lat, lon } }),
        );
      }

      const allCards = Array.from(
        document.querySelectorAll('[data-card="inspection"]'),
      );
      allCards.forEach((c) => {
        if (c !== card) c.classList.add("hidden-by-detail");
        else c.classList.remove("hidden-by-detail");
        this.syncHidden(c);
      });

      const listContent = card.querySelector(".list-content");
      let detail = card.querySelector(".detail-content");
      if (!detail) {
        detail = document.createElement("div");
        detail.className = "detail-content";
        card.appendChild(detail);
      }

      const title = (card.querySelector("h2")?.textContent || "").trim();
      const infoLines = Array.from(
        card.querySelectorAll(".list-content span"),
      ).map((n) => n.textContent.trim());
      const location =
        infoLines.find((t) => !/Last inspection:/i.test(t)) || "";
      const allInspections = JSON.parse(
        card.getAttribute("data-all-inspections") || "[]",
      );
      const latestViolations = this.readViolations(card);
      const latestItems =
        latestViolations.map((v) => this.renderViolationItem(v)).join("") ||
        `<li class="space-y-2"><div class="flex items-start pt-3 gap-2"><svg class="mt-1 h-5 w-5 fill-current stroke-current" style="color: #1b998b;" aria-hidden="true"><use href="#circle-check-svg" /></svg><h4 class="font-sans text-lg font-bold text-black flex flex-wrap items-center gap-1">No violations reported.</h4></div></li>`;

      detail.innerHTML = this.buildDetailHTML({
        title,
        location,
        card,
        latestViolations,
        latestItems,
        olderInspectionsHTML: this.renderOlderInspections(allInspections),
      });

      if (listContent) listContent.classList.add("hidden");

      const mount = card.closest(".inspections-mount");
      if (mount) {
        mount.classList.add("h-full", "flex", "flex-col");
        mount.classList.remove("space-y-3");
      }
      card.classList.add("h-full", "flex", "flex-col", "flex-1");
      detail.classList.add("flex", "flex-col", "flex-1");

      detail
        .querySelector('[data-action="back-to-results"]')
        ?.focus({ preventScroll: true });

      const container = mount
        ? mount.closest(".border-r") || mount.parentElement
        : null;
      if (container) {
        const top =
          container.getBoundingClientRect().top + window.pageYOffset - 73;
        window.scrollTo({ top, behavior: "instant" });
      }

      this.activeCard = card;
      window.location.hash = this.generateCardId(card);
      document.getElementById("no-results")?.classList.add("hidden");
    },

    backToResults() {
      window.dispatchEvent(new CustomEvent("map:restoreView"));
      window.dispatchEvent(
        new CustomEvent("update-map-markers", {
          detail: { markers: Alpine.store("inspections").markers },
        }),
      );
      document
        .querySelectorAll(".pagination-controls")
        .forEach((el) => el.classList.remove("hidden"));

      const si = this.$refs?.searchInput;
      if (si && si.value.trim()) {
        document
          .getElementById("search-results-banner")
          ?.classList.remove("hidden");
      }

      if (!this.activeCard) return;
      const card = this.activeCard;
      card.querySelector(".detail-content")?.remove();
      card.querySelector(".list-content")?.classList.remove("hidden");

      const allCards = Array.from(
        document.querySelectorAll('[data-card="inspection"]'),
      );
      allCards.forEach((c) => {
        c.classList.remove("hidden-by-detail");
        this.syncHidden(c);
      });

      const mount = card.closest(".inspections-mount");
      if (mount) {
        mount.classList.remove("h-full", "flex", "flex-col");
        mount.classList.add("space-y-3");
      }
      card.classList.remove("h-full", "flex", "flex-col", "flex-1");
      this.lastReadMoreButton?.focus({ preventScroll: true });

      this.activeCard = null;
      history.replaceState(
        null,
        "",
        window.location.pathname + window.location.search,
      );

      const container = mount
        ? mount.closest(".border-r") || mount.parentElement
        : null;
      if (container) {
        const top =
          container.getBoundingClientRect().top + window.pageYOffset - 73;
        window.scrollTo({ top, behavior: "instant" });
      }
    },

    syncHidden(card) {
      const hide =
        card.classList.contains("hidden-by-search") ||
        card.classList.contains("hidden-by-city") ||
        card.classList.contains("hidden-by-detail");
      card.classList.toggle("hidden", hide);
    },

    renderOlderInspections(allInspections) {
      if (allInspections.length <= 1) return "";
      const byDate = {};
      allInspections.slice(1).forEach((inspection) => {
        const date = inspection.inspection_date || "";
        if (!byDate[date]) byDate[date] = [];
        byDate[date].push(inspection);
      });
      const dates = Object.keys(byDate).sort(
        (a, b) => parseInspectionDate(b) - parseInspectionDate(a),
      );
      const rows = dates
        .map((date) => {
          const inspections = byDate[date];
          const allDescriptions = [];
          const allComments = [];
          inspections.forEach((insp) => {
            const desc = (insp.violation_description || "").trim();
            const comm = (insp.comment || "").trim();
            const ai = (insp.ai_summary || "").trim();
            if (desc) {
              desc.split(" | ").forEach((d) => {
                if (d.trim()) allDescriptions.push(d.trim());
              });
              const commParts = comm.split(" | ");
              const aiParts = ai.split(" | ");
              commParts.forEach((c, i) => {
                allComments.push((aiParts[i] || "").trim() || c.trim());
              });
            }
          });
          const violationCount = allDescriptions.length;
          if (!violationCount) {
            return `<div class="bg-white border-2 border-g-3 rounded-lg p-4"><div class="flex flex-wrap items-center justify-between gap-2"><div class="flex items-center gap-3 min-w-0"><svg class="h-5 w-5 flex-shrink-0 fill-g-6" aria-hidden="true"><use href="#calendar-day-svg" /></svg><span class="font-sans text-base font-bold text-g-9 whitespace-nowrap">${escapeHTML(date)}</span></div><span class="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-sm font-semibold" style="background-color: #e8f5f3; color: #1b998b;"><svg class="h-4 w-4 fill-current" aria-hidden="true"><use href="#circle-check-svg" /></svg>No violations</span></div></div>`;
          }
          const violationRows = allDescriptions
            .map(
              (desc, i) =>
                `<li class="pb-4 mb-4 border-b border-g-3 last:border-b-0 last:pb-0 last:mb-0"><h4 class="font-sans text-base font-bold text-g-9 mb-2">${escapeHTML(desc)}</h4>${allComments[i] ? `<p class="font-serif text-sm leading-relaxed text-g-7 border-l-2 border-g-4 pl-3">${escapeHTML(allComments[i])}</p>` : ""}</li>`,
            )
            .join("");
          return `<details class="group bg-white border-2 border-g-3 rounded-lg overflow-hidden"><summary class="relative flex items-start p-4 pr-10 cursor-pointer hover:bg-g-1 transition-colors"><div class="flex flex-1 flex-wrap items-center justify-between gap-x-3 gap-y-2 min-w-0"><div class="flex items-center gap-2 min-w-0"><svg class="h-5 w-5 flex-shrink-0 fill-g-6" aria-hidden="true"><use href="#calendar-day-svg" /></svg><span class="font-sans text-base font-bold text-g-9">${escapeHTML(date)}</span></div><span class="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-red-1 text-sm font-semibold text-red-7"><svg class="h-4 w-4 fill-current" aria-hidden="true"><use href="#triangle-exclamation-svg" /></svg>${violationCount} violation${violationCount !== 1 ? "s" : ""}</span></div><svg class="absolute right-4 top-4 h-5 w-5 flex-shrink-0 fill-g-6 transition-transform group-open:rotate-180" aria-hidden="true"><use href="#chevron-svg" /></svg></summary><div class="border-t border-g-3 p-4 bg-g-1"><ul class="space-y-4">${violationRows}</ul></div></details>`;
        })
        .join("");
      return `<div class="mt-8 pt-8 border-t-2 border-g-3"><h3 class="text-xl font-bold text-g-9 mb-6">Other Inspections (${dates.length})</h3><div class="space-y-4">${rows}</div></div>`;
    },

    buildDetailHTML({
      title,
      location,
      card,
      latestViolations,
      latestItems,
      olderInspectionsHTML,
    }) {
      const hasAi = latestViolations.some((v) =>
        (v.aiSummary || "").trim().replace(/^[\s|]+$/, ""),
      );
      const cardId = this.generateCardId(card);
      return `<div>
        <button type="button" class="inline-flex items-center font-sans font-bold text-navy hover:text-blue focus:outline-none focus-visible:ring-2 focus-visible:ring-g-4 rounded" data-action="back-to-results" aria-label="Back to results">
          <svg class="h-5 w-5 flex-shrink-0 fill-current" aria-hidden="true"><use href="#chevron-left-svg" /></svg>
          <span class="ml-1.5">Back</span>
        </button>
        <div class="flex items-start justify-between gap-6 py-4 pr-4 sm:pr-6">
          <div class="min-w-0">
            <h2 class="text-3xl font-bold text-black break-words">${escapeHTML(title)}</h2>
            ${location ? `<div class="mt-2 space-y-1 text-g-6"><div class="flex items-center gap-1"><svg class="h-4 w-4 flex-shrink-0 fill-g-7" aria-hidden="true"><use href="#map-pin-svg" /></svg><span>${escapeHTML(location)}</span></div></div>` : ""}
            <div class="mt-3 flex flex-wrap items-center gap-2">
              <button onclick="window.dispatchEvent(new CustomEvent('open-alerts-modal', { detail: { facilityName: ${this.jsStringAttr(title)}, facilityId: ${this.jsStringAttr(cardId)} } }))" class="inline-flex items-center gap-2 rounded-md bg-g-9 px-4 py-2 font-sans font-semibold text-white transition-shadow outline-none ring-2 ring-transparent focus:ring-g-4 active:ring-g-8 hover:bg-g-8">
                <span>Get alerts</span>
                <svg class="h-4 w-4 fill-current" aria-hidden="true"><use href="#bell-svg" /></svg>
              </button>
              <div class="flex items-center gap-2">
                <button onclick="window.location.href='mailto:?subject=${encodeURIComponent(title)}&body=${encodeURIComponent(window.location.href)}'" class="rounded-full p-2 bg-g-9 text-white" aria-label="Share via Email"><svg class="h-5 w-5 fill-white" aria-hidden="true"><use href="#envelope-svg" /></svg></button>
                <button onclick="window.open('https://www.facebook.com/sharer/sharer.php?u=' + encodeURIComponent(window.location.href), '_blank')" class="rounded-full p-2 bg-g-9 text-white" aria-label="Share on Facebook"><svg class="h-5 w-5 fill-white" aria-hidden="true"><use href="#fb-svg" /></svg></button>
                <button onclick="window.open('https://twitter.com/intent/tweet?url=' + encodeURIComponent(window.location.href) + '&text=' + encodeURIComponent(${this.jsStringAttr(title)}), '_blank')" class="rounded-full p-2 bg-g-9 text-white" aria-label="Share on X"><svg class="h-5 w-5 fill-white" aria-hidden="true"><use href="#twitter-svg" /></svg></button>
                <button onclick="navigator.clipboard.writeText(window.location.href).then(() => alert('Link copied!'))" class="rounded-full p-2 bg-orange text-white" aria-label="Copy link"><svg class="h-5 w-5 fill-white" aria-hidden="true"><use href="#share-svg" /></svg></button>
              </div>
            </div>
          </div>
        </div>
        <section class="space-y-3">
          <h3 class="text-xl font-bold text-g-9 mb-3">Latest Inspection</h3>
          ${hasAi ? `<div class="mb-3 flex items-start gap-2"><svg class="mt-0.5 h-5 w-5 flex-shrink-0 fill-current text-g-4" aria-hidden="true"><use href="#robot-svg" /></svg><p class="text-sm font-sans italic text-g-5">AI-generated summaries are provided to make inspector comments easier to understand.</p></div>` : ""}
          <ul class="space-y-3">${latestItems}</ul>
          ${hasAi ? `<p class="mt-4 text-sm font-sans italic text-g-5">While we strive for accuracy, AI may occasionally misinterpret technical language. Always refer to the full inspection report (linked below) for complete details.</p>` : ""}
        </section>
        ${olderInspectionsHTML}
        <div class="pt-5">
          <a href="https://www.pafoodsafety.pa.gov/web/inspection/publicinspectionsearch.aspx" class="group inline-flex items-center gap-2 font-sans font-semibold text-navy hover:text-blue">
            <svg class="h-5 w-5 flex-shrink-0 fill-current group-hover:text-blue" aria-hidden="true"><use href="#link-svg" /></svg>
            <span>Read the full report</span>
          </a>
        </div>
      </div>`;
    },

    renderViolationItem(v) {
      const title = (v.title || "").trim();
      const aiSummary = (v.aiSummary || "").trim().replace(/^[\s|]+$/, "");
      const comment = (v.comment || "").trim().replace(/^[\s|]+$/, "");
      const displayComment = aiSummary || comment;
      const riskLevel = (v.riskLevel || "").toLowerCase();
      let color = "#D70000";
      if (riskLevel.includes("low risk")) color = "#009EDB";
      else if (riskLevel.includes("moderate risk")) color = "#FFCB03";
      return `<li class="space-y-2 pb-4 mb-4 border-b border-g-3 last:border-b-0 last:pb-0 last:mb-0"><div class="flex items-start pt-2 gap-2"><svg class="mt-1 h-5 w-5 fill-current stroke-current flex-shrink-0" style="color: ${color};" aria-hidden="true"><use href="#triangle-exclamation-svg" /></svg><h4 class="font-sans text-lg font-bold text-black break-words">${escapeHTML(title)}</h4></div>${displayComment ? `<p class="font-serif leading-relaxed text-g-7 border-l-4 border-g-5 pl-4 ml-7">${escapeHTML(displayComment)}</p>` : ""}</li>`;
    },

    readViolations(card) {
      const violationDesc = (
        card.getAttribute("data-violation-description") || ""
      ).trim();
      const spotlightPa = (card.getAttribute("data-spotlight-pa") || "").trim();
      const violationComment = (
        card.getAttribute("data-violation-comment") || ""
      ).trim();
      if (!violationDesc && !spotlightPa && !violationComment) return [];

      const descriptions = violationDesc
        .split(" | ")
        .map((s) => s.trim())
        .filter(Boolean);
      const spotlights = spotlightPa.split(" | ").map((s) => s.trim());
      const comments = violationComment.split(" | ").map((s) => s.trim());
      const aiSummaries = (card.getAttribute("data-ai-summary") || "")
        .split(" | ")
        .map((s) => s.trim());
      const riskLevels = (card.getAttribute("data-risk-level") || "")
        .split(" | ")
        .map((s) => s.trim());

      const violations = [];
      for (
        let i = 0;
        i < Math.max(descriptions.length, spotlights.length, comments.length);
        i++
      ) {
        const title =
          spotlights[i] && spotlights[i] !== "NA" && spotlights[i] !== ""
            ? spotlights[i]
            : descriptions[i] || "Violation reported";
        violations.push({
          title,
          comment: comments[i] || "",
          aiSummary: aiSummaries[i] || "",
          riskLevel: riskLevels[i] || "",
          originalIndex: i,
        });
      }

      const priority = (r) => {
        const l = (r || "").toLowerCase();
        if (l.includes("high risk")) return 1;
        if (l.includes("moderate risk")) return 2;
        if (l.includes("low risk")) return 3;
        return 4;
      };
      violations.sort(
        (a, b) =>
          priority(a.riskLevel) - priority(b.riskLevel) ||
          a.originalIndex - b.originalIndex,
      );
      return violations;
    },
  };
}
