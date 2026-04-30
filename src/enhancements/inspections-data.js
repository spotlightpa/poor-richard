import Alpine from "alpinejs/src/index.js";
import {
  normalizeString,
  levenshtein,
  parseInspectionDate,
  getRiskScore,
  escapeHTML,
  simplifyAddress,
  getRiskPriority,
  riskToColorAndBadge,
  generateInspectionCardId,
} from "../utils/inspections.js";

const ITEMS_PER_PAGE = 10;

function groupByFacility(rows) {
  const grouped = {};
  rows.forEach((row) => {
    const id = row.id || `${row.facility} — ${row.address}`;
    if (!grouped[id]) grouped[id] = [];
    grouped[id].push(row);
  });
  Object.keys(grouped).forEach((id) => {
    grouped[id].sort(
      (a, b) =>
        parseInspectionDate(b.inspection_date) -
        parseInspectionDate(a.inspection_date),
    );
  });
  return grouped;
}

function buildFacilityIndex(groupedFacilities) {
  return Object.keys(groupedFacilities).map((id) => {
    const row = groupedFacilities[id][0];
    return {
      id,
      searchText: normalizeString(
        [
          row.facility || "",
          row.address || "",
          row.city || "",
          row.inspection_date || "",
        ].join(" "),
      ),
      city: normalizeString(row.city || ""),
      dateMs: parseInspectionDate(row.inspection_date).getTime(),
      riskScore: getRiskScore(row.risk_level),
      nameKey: (row.facility || "").toLowerCase(),
    };
  });
}

function buildCityList(allData) {
  const counts = {};
  const labelByKey = {};
  const keys = [];

  for (const row of allData) {
    const raw = row.city ? String(row.city) : "";
    const nrm = normalizeString(raw);
    if (!nrm) continue;

    let key = nrm;
    if (!counts[key]) {
      const found = keys.find((existing) => {
        if (existing.charAt(0) !== key.charAt(0)) return false;
        if (Math.abs(existing.length - key.length) > 4) return false;
        return levenshtein(existing, key) <= 3;
      });
      if (found) key = found;
    }

    if (!counts[key]) {
      counts[key] = 0;
      labelByKey[key] = raw;
      keys.push(key);
    }
    counts[key] += 1;
  }

  return keys
    .map((k) => ({
      value: labelByKey[k] || k,
      text: labelByKey[k] || k,
      count: counts[k] || 0,
    }))
    .sort((a, b) => b.count - a.count);
}

function sortFacilities(filteredIds, facilityIndexMap, currentSort) {
  const sorted = [...filteredIds];

  sorted.sort((a, b) => {
    const A = facilityIndexMap[a] || {};
    const B = facilityIndexMap[b] || {};

    switch (currentSort) {
      case "alpha-asc":
      case "alphabetical":
        return (A.nameKey || "").localeCompare(B.nameKey || "");

      case "alpha-desc":
        return (B.nameKey || "").localeCompare(A.nameKey || "");

      case "date-asc":
        return (A.dateMs || 0) - (B.dateMs || 0);

      case "risk-desc":
      case "high-risk":
        return (B.riskScore || 0) - (A.riskScore || 0);

      case "risk-asc":
        return (A.riskScore || 0) - (B.riskScore || 0);

      default:
        return (B.dateMs || 0) - (A.dateMs || 0);
    }
  });

  return sorted;
}

function filterFacilities(facilityIndex, searchQuery, currentCity) {
  const needle = normalizeString(searchQuery);
  const tokens = needle ? needle.split(/\s+/).filter(Boolean) : [];
  const nCity = normalizeString(currentCity);

  return facilityIndex.filter((entry) => {
    const searchMatch =
      tokens.length === 0 || tokens.every((t) => entry.searchText.includes(t));
    if (!searchMatch) return false;
    if (!nCity) return true;

    const ec = entry.city;
    if (ec === nCity) return true;
    if (!ec || ec.charAt(0) !== nCity.charAt(0)) return false;
    if (Math.abs(ec.length - nCity.length) > 4) return false;
    return levenshtein(ec, nCity) <= 3;
  });
}

function rowsToMarkers(rows, startIndex) {
  const groups = {};
  const groupOrder = [];

  rows.forEach((row, i) => {
    const lat = parseFloat(row.Latitude);
    const lon = parseFloat(row.Longitude);
    if (!lat || !lon || isNaN(lat) || isNaN(lon)) return;
    const key = `${lat.toFixed(6)},${lon.toFixed(6)}`;
    if (!groups[key]) {
      groups[key] = { lat, lon, rows: [], firstIndex: startIndex + i };
      groupOrder.push(key);
    }
    groups[key].rows.push({ row, index: startIndex + i });
  });

  return groupOrder.map((key) => {
    const group = groups[key];
    const maxPriority = group.rows.reduce(
      (max, entry) =>
        Math.max(max, getRiskPriority(entry.row.risk_level || "")),
      0,
    );
    const style = riskToColorAndBadge(maxPriority);
    const id = `inspection-${group.firstIndex}`;

    const facilitiesHTML = group.rows
      .map(({ row }) => {
        const p = getRiskPriority(row.risk_level || "");
        const s = riskToColorAndBadge(p);
        const addressLine =
          simplifyAddress(row.address || "") || row.city || "";
        return `<div class="pt-2.5 pb-2.5 mb-2.5 border-b border-g-2 first:pt-0 last:border-b-0 last:pb-0 last:mb-0">
          <h3 class="font-bold text-base leading-tight text-g-9 mb-1">${escapeHTML(row.facility || "Facility")}</h3>
          ${addressLine ? `<p class="text-xs text-g-6 mb-1.5">${escapeHTML(addressLine)}</p>` : ""}
          <span class="inline-block px-2 py-1 text-xs font-semibold rounded-full text-white" style="background-color: ${s.color};">${s.badgeText}</span>
        </div>`;
      })
      .join("");

    return {
      lon: group.lon,
      lat: group.lat,
      color: style.color,
      inspectionId: id,
      popupHTML: `<div class="min-w-[200px] max-w-[280px] p-3">${facilitiesHTML}</div>`,
    };
  });
}

function createInspectionCard(data, index, allInspections) {
  const facilityName = data.facility || "Facility";
  const address = data.address || "";
  const city = data.city || "";
  const inspectionDate = data.inspection_date || "";
  const uniqueId = `inspection-${index}`;
  allInspections = allInspections || [data];

  const addressLine = simplifyAddress(address) || city;
  const searchIndex = [facilityName, address, city, inspectionDate]
    .join(" ")
    .toLowerCase();

  const card = document.createElement("div");
  card.setAttribute("data-card", "inspection");
  card.setAttribute("data-index", searchIndex);
  card.setAttribute("data-date", inspectionDate);
  card.setAttribute("data-city", city);
  card.setAttribute("data-inspection-id", uniqueId);
  card.setAttribute("data-risk-level", data.risk_level || "");
  card.setAttribute("data-violation-comment", data.comment || "");
  card.setAttribute("data-spotlight-pa", data.spotlight_pa || "");
  card.setAttribute(
    "data-violation-description",
    data.violation_description || "",
  );
  card.setAttribute("data-ai-summary", data.ai_summary || "");
  card.setAttribute("data-all-inspections", JSON.stringify(allInspections));
  card.setAttribute("id", uniqueId);
  if (data.Latitude && data.Longitude) {
    card.setAttribute("data-lat", data.Latitude);
    card.setAttribute("data-lon", data.Longitude);
  }
  card.className =
    "w-full h-full flex flex-col space-y-3 bg-white p-8 shadow md:p-10";

  const addressRow = addressLine
    ? `<div class="flex items-center gap-1"><svg class="h-4 w-4 flex-shrink-0 fill-current text-g-7"><use href="#location-svg" /></svg><span>${escapeHTML(addressLine)}</span></div>`
    : "";
  const dateRow = inspectionDate
    ? `<div class="flex items-center gap-1"><svg class="h-4 w-4 flex-shrink-0 fill-current text-g-7"><use href="#calendar-day-svg" /></svg><span>Last inspection: ${escapeHTML(inspectionDate)}</span></div>`
    : "";

  const riskCounts = { high: 0, moderate: 0, low: 0, other: 0 };
  if (data.risk_level) {
    data.risk_level.split(" | ").forEach((r) => {
      r = r.trim().toLowerCase();
      if (r === "high risk") riskCounts.high++;
      else if (r === "moderate risk") riskCounts.moderate++;
      else if (r === "low risk") riskCounts.low++;
      else if (r === "na" || r === "") riskCounts.other++;
    });
  }

  const totalViolations =
    riskCounts.high + riskCounts.moderate + riskCounts.low + riskCounts.other;
  let violationBadges = "";
  if (totalViolations === 0) {
    violationBadges = `<li class="flex items-center gap-2"><svg class="h-6 w-6 fill-current" style="color: #1b998b;"><use href="#circle-check-svg" /></svg><span class="text-base font-semibold">0 violations</span></li>`;
  } else {
    if (riskCounts.high > 0)
      violationBadges += `<li class="flex items-center gap-2"><svg class="h-5 w-5 fill-current" style="color: #D70000;"><use href="#triangle-exclamation-svg" /></svg><span class="text-base font-semibold">${riskCounts.high} high risk violation${riskCounts.high !== 1 ? "s" : ""}</span></li>`;
    if (riskCounts.moderate > 0)
      violationBadges += `<li class="flex items-center gap-2"><svg class="h-5 w-5 fill-current" style="color: #FFCB03;"><use href="#triangle-exclamation-svg" /></svg><span class="text-base font-semibold">${riskCounts.moderate} moderate risk violation${riskCounts.moderate !== 1 ? "s" : ""}</span></li>`;
    if (riskCounts.low > 0)
      violationBadges += `<li class="flex items-center gap-2"><svg class="h-5 w-5 fill-current" style="color: #009EDB;"><use href="#triangle-exclamation-svg" /></svg><span class="text-base font-semibold">${riskCounts.low} low risk violation${riskCounts.low !== 1 ? "s" : ""}</span></li>`;
    if (riskCounts.other > 0)
      violationBadges += `<li class="flex items-center gap-2"><svg class="h-5 w-5 fill-current" style="color: #6b7280;"><use href="#triangle-exclamation-svg" /></svg><span class="text-base font-semibold">${riskCounts.other} other violation${riskCounts.other !== 1 ? "s" : ""}</span></li>`;
  }

  card.innerHTML = `<div class="list-content">
    <h2 class="text-3xl font-bold">${escapeHTML(facilityName)}</h2>
    <div class="mt-2 space-y-1 text-g-6">${addressRow}${dateRow}</div>
    <ul class="mt-4 space-y-2">${violationBadges}</ul>
    <div class="pt-2">
      <button
        class="mt-4 flex w-full items-center justify-between rounded-md border-2 border-yellow-5 bg-yellow-4 px-4 py-3 font-bold text-yellow-9 transition hover:bg-yellow-3"
        aria-label="Read more about this inspection"
        data-read-more="${uniqueId}"
      >
        <span class="mx-auto">Read more</span>
        <svg class="h-5 w-5 fill-yellow-9"><use href="#chevron-right-svg" /></svg>
</button>
    </div>
  </div>`;

  return card;
}

export default function inspectionsData() {
  return {
    rendering: false,
    initialRender: true,
    hashHandled: false,
    facilityIndex: [],
    facilityIndexMap: {},

    get store() {
      return Alpine.store("inspections");
    },

    init() {
      window.addEventListener("inspections-data-ready", (event) => {
        if (this.hashHandled) return;
        this.hashHandled = true;
        this.loadData(event.detail?.data || []);
      });

      window.addEventListener("marker-click", (event) => {
        const inspectionId = event.detail?.id;
        if (!inspectionId) return;
        const nodes = Array.from(
          document.querySelectorAll(`#${CSS.escape(inspectionId)}`),
        );
        const card = nodes.find((el) => el.offsetParent !== null) || nodes[0];
        if (!card) return;
        card.querySelector("[data-read-more]")?.click();
      });

      this.$watch("store.currentSort", (value) => {
        if (document.querySelector(".detail-content")) return;
        localStorage.setItem("inspections-sort", value);
        this.store.currentPage = 1;

        if (this._sortRenderFrame) cancelAnimationFrame(this._sortRenderFrame);
        this._sortRenderFrame = requestAnimationFrame(() => {
          this.resortAndRender();
        });
      });
      this.$watch("store.searchQuery", () => {
        if (document.querySelector(".detail-content")) return;
        this.performSearch();
      });

      this.$watch("store.currentCity", () => {
        if (document.querySelector(".detail-content")) return;
        this.performSearch();
      });

      this.$watch("store.currentPage", () => {
        if (document.querySelector(".detail-content")) return;
        this.renderPage();
        this.renderPaginationControls();
      });
    },

    loadData(allData) {
      this.store.allData = allData;
      window.__inspectionsAllData = allData;

      this.store.groupedFacilities = groupByFacility(allData);
      this.facilityIndex = buildFacilityIndex(this.store.groupedFacilities);
      this.facilityIndexMap = Object.fromEntries(
        this.facilityIndex.map((e) => [e.id, e]),
      );

      this.store.filteredData = this.facilityIndex.map((e) => e.id);
      this.store.cities = buildCityList(allData);
      window.__inspectionsCities = this.store.cities;

      window.dispatchEvent(
        new CustomEvent("inspections-cities-ready", {
          detail: { cities: this.store.cities },
        }),
      );

      this.store.currentPage = 1;
      this.rendering = false;
      this.store.markers = [];

      this.updateTotalPages();

      const hash = window.location.hash.slice(1);
      const qParam =
        new URLSearchParams(window.location.search).get("facility") || "";
      const target = hash || qParam;
      if (target) {
        const foundPage = this.findPageForHash(target);
        if (foundPage > 0) this.store.currentPage = foundPage;
        const onRendered = () => {
          window.removeEventListener("inspections-page-rendered", onRendered);
          this.handleHashOnMobile(target);
        };
        window.addEventListener("inspections-page-rendered", onRendered);
      }

      this.resortAndRender();

      window.addEventListener("mobile-view-changed", (e) => {
        if (e.detail?.view === "map") this.syncMarkers();
      });

      window.addEventListener("map:ready", () => {
        this.syncMarkers();
      });
    },

    updateTotalPages() {
      this.store.totalPages = Math.max(
        1,
        Math.ceil(this.store.filteredData.length / ITEMS_PER_PAGE),
      );
    },

    updateSearchUI() {
      const banner = document.getElementById("search-results-banner");
      const noResults = document.getElementById("no-results");

      const hasAppliedSearch =
        !!(this.store.searchQuery && this.store.searchQuery.trim()) ||
        !!(this.store.currentCity && this.store.currentCity.trim());

      const hasResults = this.store.filteredData.length > 0;

      if (banner) {
        banner.classList.toggle("hidden", !hasAppliedSearch);
      }

      if (noResults) {
        noResults.classList.toggle("hidden", !hasAppliedSearch || hasResults);
      }
    },

    resortAndRender() {
      this.store.sortedFilteredData = sortFacilities(
        this.store.filteredData,
        this.facilityIndexMap,
        this.store.currentSort,
      );
      this.renderPage();
      this.renderPaginationControls();
      this.updateSearchUI();
    },

    performSearch() {
      if (this._searchTimer) clearTimeout(this._searchTimer);
      this._searchTimer = setTimeout(() => {
        if (this._searchRenderFrame)
          cancelAnimationFrame(this._searchRenderFrame);
        this._searchRenderFrame = requestAnimationFrame(() => {
          const matched = filterFacilities(
            this.facilityIndex,
            this.store.searchQuery,
            this.store.currentCity,
          );
          const newFilteredData = matched.map((e) => e.id);

          const sameLength =
            newFilteredData.length === this.store.filteredData.length;
          const unchanged =
            sameLength &&
            newFilteredData.every((id, i) => id === this.store.filteredData[i]);

          if (unchanged) return;

          this.store.filteredData = newFilteredData;
          this.store.currentPage = 1;
          this.store.markers = [];
          this.updateTotalPages();
          this.resortAndRender();
        });
      }, 50);
    },
    renderPage() {
      if (document.querySelector(".detail-content")) return;
      if (this.rendering) return;
      this.rendering = true;

      const start = (this.store.currentPage - 1) * ITEMS_PER_PAGE;
      const end = Math.min(
        start + ITEMS_PER_PAGE,
        this.store.sortedFilteredData.length,
      );
      const pageIds = this.store.sortedFilteredData.slice(start, end);
      const pageGroups = pageIds.map((id) => this.store.groupedFacilities[id]);

      this.clearMounts();

      if (pageGroups.length === 0) {
        this.store.markers = [];
        this.syncMarkers();
        this.rendering = false;
        this.updateSearchUI();
        return;
      }

      this.appendCards(pageGroups, start);
      window.dispatchEvent(new CustomEvent("inspections-page-rendered"));

      const flatRows = pageGroups.map((g) => g[0]);
      this.store.markers = rowsToMarkers(flatRows, start);
      this.syncMarkers();

      if (!this.initialRender) {
        const scrollTarget = document.querySelector(".inspections-mount");
        if (scrollTarget) {
          const top =
            scrollTarget.getBoundingClientRect().top + window.pageYOffset - 73;
          window.scrollTo({ top, behavior: "smooth" });
        }
      }
      this.initialRender = false;
      this.rendering = false;
      setTimeout(() => this.syncMarkers(), 100);
    },

    appendCards(groupedInspections, startIndex) {
      const mounts = this.getMountPoints();
      mounts.forEach((mount) => {
        groupedInspections.forEach((inspections, i) => {
          const sorted = [...inspections].sort(
            (a, b) =>
              parseInspectionDate(b.inspection_date) -
              parseInspectionDate(a.inspection_date),
          );
          mount.appendChild(
            createInspectionCard(sorted[0], startIndex + i, sorted),
          );
        });
      });
    },

    getMountPoints() {
      return Array.from(document.querySelectorAll(".inspections-mount"));
    },

    clearMounts() {
      this.getMountPoints().forEach((m) => (m.innerHTML = ""));
    },

    syncMarkers() {
      window.__inspectionsMarkers = this.store.markers;
      window.dispatchEvent(
        new CustomEvent("update-map-markers", {
          detail: { markers: this.store.markers },
        }),
      );
    },

    renderPaginationControls() {
      document
        .querySelectorAll(".pagination-controls")
        .forEach((el) => el.remove());

      if (this.store.filteredData.length === 0 || this.store.totalPages <= 1)
        return;

      const controls = document.createElement("div");
      controls.className =
        "pagination-controls flex items-center justify-center gap-2 bg-white px-4 py-6 shadow mt-3";

      const currentPage = this.store.currentPage;
      const totalPages = this.store.totalPages;

      controls.innerHTML = `
        <button class="pagination-btn pagination-prev flex h-12 w-12 sm:h-10 sm:w-10 items-center justify-center rounded-full border-2 border-g-4 bg-white text-g-7 transition-all duration-200 hover:border-g-6 hover:bg-g-2 disabled:cursor-not-allowed disabled:opacity-40 flex-shrink-0" ${currentPage === 1 ? "disabled" : ""} aria-label="Previous page">
          <svg class="h-5 w-5 fill-current" viewBox="0 0 24 24"><path d="M15.41 7.41L14 6l-6 6 6 6 1.41-1.41L10.83 12z"/></svg>
        </button>
        <div class="pagination-numbers hidden sm:flex flex-1 items-center justify-evenly gap-2 md:gap-3 lg:gap-4 px-2 md:px-6 lg:px-8"></div>
        <div class="flex sm:hidden flex-1 items-center justify-center gap-2 text-sm font-sans font-semibold text-g-7">
          <span>Page ${currentPage.toLocaleString()} of ${totalPages.toLocaleString()}</span>
        </div>
        <button class="pagination-btn pagination-next flex h-12 w-12 sm:h-10 sm:w-10 items-center justify-center rounded-full border-2 border-g-4 bg-white text-g-7 transition-all duration-200 hover:border-g-6 hover:bg-g-2 disabled:cursor-not-allowed disabled:opacity-40 flex-shrink-0" ${currentPage === totalPages ? "disabled" : ""} aria-label="Next page">
          <svg class="h-5 w-5 fill-current" viewBox="0 0 24 24"><path d="M8.59 16.59L10 18l6-6-6-6-1.41 1.41L13.17 12z"/></svg>
        </button>`;

      const numbersContainer = controls.querySelector(".pagination-numbers");
      this.getPageNumbers(currentPage, totalPages).forEach((pageNum) => {
        if (pageNum === "...") {
          const ellipsis = document.createElement("span");
          ellipsis.className = "px-2 text-g-5";
          ellipsis.textContent = "...";
          numbersContainer.appendChild(ellipsis);
        } else {
          const btn = document.createElement("button");
          btn.className =
            pageNum === currentPage
              ? "flex h-10 min-w-10 items-center justify-center rounded-full bg-g-9 px-4 font-sans text-sm font-bold text-white transition-all duration-200"
              : "flex h-10 min-w-10 items-center justify-center rounded-full px-4 font-sans text-sm font-medium text-g-7 transition-all duration-200 hover:bg-g-2";
          btn.textContent = pageNum.toLocaleString();
          btn.setAttribute("aria-label", `Page ${pageNum.toLocaleString()}`);
          if (pageNum === currentPage) btn.setAttribute("aria-current", "page");
          btn.addEventListener("click", () => {
            this.store.currentPage = pageNum;
          });
          numbersContainer.appendChild(btn);
        }
      });

      controls
        .querySelector(".pagination-prev")
        .addEventListener("click", () => {
          if (this.store.currentPage > 1) this.store.currentPage--;
        });
      controls
        .querySelector(".pagination-next")
        .addEventListener("click", () => {
          if (this.store.currentPage < this.store.totalPages)
            this.store.currentPage++;
        });

      this.getMountPoints().forEach((mount) => {
        const clone = controls.cloneNode(true);
        clone
          .querySelector(".pagination-prev")
          .addEventListener("click", () => {
            if (this.store.currentPage > 1) this.store.currentPage--;
          });
        clone
          .querySelector(".pagination-next")
          .addEventListener("click", () => {
            if (this.store.currentPage < this.store.totalPages)
              this.store.currentPage++;
          });
        clone
          .querySelectorAll(".pagination-numbers button")
          .forEach((btn, idx) => {
            const pageNums = this.getPageNumbers(
              currentPage,
              totalPages,
            ).filter((p) => p !== "...");
            const pageNum = pageNums[idx];
            if (pageNum)
              btn.addEventListener("click", () => {
                this.store.currentPage = pageNum;
              });
          });
        mount.parentNode.insertBefore(clone, mount.nextSibling);
      });
    },

    getPageNumbers(current, total) {
      const pages = [];
      if (total <= 7) {
        for (let i = 1; i <= total; i++) pages.push(i);
      } else {
        pages.push(1);
        if (current > 3) pages.push("...");
        let start = Math.max(2, current - 1);
        let end = Math.min(total - 1, current + 1);
        if (current <= 3) {
          start = 2;
          end = 4;
        }
        if (current >= total - 2) {
          start = total - 3;
          end = total - 1;
        }
        for (let j = start; j <= end; j++) pages.push(j);
        if (current < total - 2) pages.push("...");
        pages.push(total);
      }
      return pages;
    },

    findPageForHash(hash) {
      const store = this.store;
      for (let i = 0; i < store.filteredData.length; i++) {
        const inspections = store.groupedFacilities[store.filteredData[i]];
        if (inspections?.[0]) {
          const cardId = generateInspectionCardId(
            (inspections[0].facility || "").trim(),
          );
          if (cardId === hash) return Math.floor(i / ITEMS_PER_PAGE) + 1;
        }
      }
      return -1;
    },

    handleHashOnMobile(hash) {
      if (window.innerWidth >= 768) return;
      const mobileMounts = Array.from(
        document.querySelectorAll(".inspections-mount"),
      ).filter(
        (m) => m.classList.contains("space-y-3") && m.offsetParent !== null,
      );
      if (!mobileMounts.length) return;

      const cards = mobileMounts[0].querySelectorAll(
        '[data-card="inspection"]',
      );
      for (const card of cards) {
        const title = (card.querySelector("h2")?.textContent || "").trim();
        if (generateInspectionCardId(title) === hash) {
          card.querySelector("[data-read-more]")?.click();
          setTimeout(
            () => window.scrollTo({ top: 0, behavior: "smooth" }),
            200,
          );
          break;
        }
      }
    },
  };
}
