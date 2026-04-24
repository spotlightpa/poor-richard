const HTML_ESCAPE_LOOKUP = {
  "&": "&amp;",
  "<": "&lt;",
  ">": "&gt;",
  '"': "&quot;",
  "'": "&#39;",
};

export function escapeHTML(str) {
  if (str == null) return "";
  return String(str).replace(/[&<>"']/g, (char) => HTML_ESCAPE_LOOKUP[char]);
}

export function normalizeString(str) {
  return (str || "")
    .toLowerCase()
    .replace(/[^a-z0-9\s]/g, "")
    .replace(/\s+/g, " ")
    .trim();
}

export function levenshtein(a, b) {
  a = normalizeString(a);
  b = normalizeString(b);

  if (!a && !b) return 0;
  if (!a) return b.length;
  if (!b) return a.length;

  const m = a.length;
  const n = b.length;
  const dp = new Array(n + 1);

  for (let j = 0; j <= n; j++) dp[j] = j;

  for (let i = 1; i <= m; i++) {
    let prev = dp[0];
    dp[0] = i;

    for (let j = 1; j <= n; j++) {
      const tmp = dp[j];
      const cost = a.charAt(i - 1) === b.charAt(j - 1) ? 0 : 1;
      dp[j] = Math.min(dp[j] + 1, dp[j - 1] + 1, prev + cost);
      prev = tmp;
    }
  }

  return dp[n];
}

export function parseInspectionDate(str) {
  if (!str) return new Date(0);

  const s = String(str)
    .replace(/Jan\./g, "January")
    .replace(/Feb\./g, "February")
    .replace(/Aug\./g, "August")
    .replace(/Sept\./g, "September")
    .replace(/Oct\./g, "October")
    .replace(/Nov\./g, "November")
    .replace(/Dec\./g, "December");

  const d = new Date(s);
  return isNaN(d.getTime()) ? new Date(0) : d;
}

export function getRiskScore(riskLevel) {
  if (!riskLevel) return 0;

  let score = 0;
  riskLevel.split(/[|,]/).forEach((r) => {
    r = r.trim().toLowerCase();
    if (r === "high risk") score += 25;
    else if (r === "moderate risk") score += 10;
    else if (r === "low risk") score += 3;
  });

  return score;
}

export function simplifyAddress(fullAddress) {
  try {
    const parts = String(fullAddress || "").split(",");
    if (parts.length >= 3) return parts.slice(0, 2).join(",").trim();
    if (parts.length === 2) return parts[0].trim();
    return String(fullAddress || "").trim();
  } catch {
    return String(fullAddress || "").trim();
  }
}

export function getRiskPriority(riskLevels) {
  const risks = (riskLevels || "")
    .split(" | ")
    .map((s) => s.trim().toLowerCase());

  if (risks.some((r) => r === "high risk")) return 3;
  if (risks.some((r) => r === "moderate risk")) return 2;
  if (risks.some((r) => r === "low risk")) return 1;
  return 0;
}

export function riskToColorAndBadge(priority) {
  if (priority === 3) {
    return { color: "#D70000", badgeText: "High Risk Violation" };
  }
  if (priority === 2) {
    return { color: "#FFCB03", badgeText: "Moderate Risk Violation" };
  }
  if (priority === 1) {
    return { color: "#009EDB", badgeText: "Low Risk Violation" };
  }
  return { color: "#1b998b", badgeText: "No Violations" };
}

export function generateInspectionCardId(title) {
  return String(title || "")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

export function cityOptionsFromList(list = []) {
  return list
    .map((item) => {
      if (typeof item === "string") {
        return { value: item, text: item };
      }

      return {
        value: item?.value || item?.text || "",
        text: item?.text || item?.value || "",
      };
    })
    .filter((item) => item.text);
}

export function filterDropdownOptions(options, query, limit = 20) {
  const q = normalizeString(query);

  if (!q) {
    return options.slice(0, limit);
  }

  const exactMatches = [];
  const partialMatches = [];

  for (const opt of options) {
    const normalized = normalizeString(opt.text);

    if (normalized === q) {
      exactMatches.push(opt);
    } else if (normalized.includes(q)) {
      partialMatches.push(opt);
    }
  }

  const hits = exactMatches.concat(partialMatches);

  if (hits.length > 0) {
    return hits.slice(0, limit);
  }

  if (q.length < 3) {
    return [];
  }

  const fuzzyMatches = [];

  for (const opt of options) {
    const normalized = normalizeString(opt.text);
    if (!normalized) continue;
    if (normalized.charAt(0) !== q.charAt(0)) continue;
    if (Math.abs(normalized.length - q.length) > 3) continue;

    if (levenshtein(normalized, q) <= 2) {
      fuzzyMatches.push(opt);
      if (fuzzyMatches.length >= limit) break;
    }
  }

  return fuzzyMatches;
}
