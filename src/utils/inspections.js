export function escapeHTML(str) {
  if (!str) return "";
  var div = document.createElement("div");
  div.textContent = str;
  return div.innerHTML;
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
  const m = a.length,
    n = b.length;
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
  var s = String(str)
    .replace(/Jan\./g, "January")
    .replace(/Feb\./g, "February")
    .replace(/Aug\./g, "August")
    .replace(/Sept\./g, "September")
    .replace(/Oct\./g, "October")
    .replace(/Nov\./g, "November")
    .replace(/Dec\./g, "December");
  var d = new Date(s);
  return isNaN(d.getTime()) ? new Date(0) : d;
}

export function getRiskScore(riskLevel) {
  if (!riskLevel) return 0;
  var score = 0;
  riskLevel.split(/[|,]/).forEach(function (r) {
    r = r.trim().toLowerCase();
    if (r === "high risk") score += 25;
    else if (r === "moderate risk") score += 10;
    else if (r === "low risk") score += 3;
  });
  return score;
}
