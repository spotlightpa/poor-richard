const API_BASE =
  process.env.AMUSELABS_API_BASE || "https://sandbox.amuselabs.com/pmm";

let cachedToken = null;

async function getToken() {
  if (cachedToken && cachedToken.expiresAt > Date.now() + 5000) {
    return cachedToken.value;
  }

  const resp = await fetch(`${API_BASE}/api/v2/token`, {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body: new URLSearchParams({
      client_id: process.env.AMUSELABS_CLIENT_ID,
      client_secret: process.env.AMUSELABS_CLIENT_SECRET,
    }),
  });
  if (!resp.ok) {
    throw new Error(`AmuseLabs token request failed: ${resp.status}`);
  }
  const data = await resp.json();

  cachedToken = {
    value: data.access_token,
    expiresAt: data.expires_at_seconds
      ? data.expires_at_seconds * 1000
      : Date.now() + 5 * 60 * 1000,
  };
  return cachedToken.value;
}

function extractScore(playProgress) {
  if (!playProgress) return null;
  const candidates = [
    playProgress.wordsFound,
    playProgress.numWordsFound,
    playProgress.foundWords,
    playProgress.score,
  ];
  for (const value of candidates) {
    if (typeof value === "number") return value;
    if (Array.isArray(value)) return value.length;
  }
  return null;
}

async function getTodaysPlays(series, token) {
  const startOfDay = new Date();
  startOfDay.setUTCHours(0, 0, 0, 0);

  const plays = [];
  let offset = 0;
  const limit = 1000;

  for (;;) {
    const params = new URLSearchParams({
      series,
      from: startOfDay.toISOString(),
      limit: String(limit),
      offset: String(offset),
      getUserInfo: "true",
    });
    const resp = await fetch(`${API_BASE}/api/v2/analytics/plays?${params}`, {
      headers: { Authorization: `Bearer ${token}`, Accept: "application/json" },
    });
    if (!resp.ok) {
      throw new Error(`AmuseLabs plays request failed: ${resp.status}`);
    }
    const data = await resp.json();
    plays.push(...(data.plays || []));
    if (!data.hasMore || plays.length >= 10000) break;
    offset += limit;
  }

  return plays;
}

export const handler = async (event) => {
  if (event.httpMethod !== "GET") {
    return { statusCode: 405, body: "Method Not Allowed" };
  }

  const series = event.queryStringParameters?.series;
  if (!series) {
    return {
      statusCode: 400,
      body: JSON.stringify({ error: "series is required." }),
    };
  }

  try {
    const token = await getToken();
    const plays = await getTodaysPlays(series, token);

    const bestByUser = new Map();
    for (const play of plays) {
      const score = extractScore(play.playProgress);
      if (score === null) continue;
      const existing = bestByUser.get(play.userId);
      if (!existing || score > existing.score) {
        const name =
          play.userInfo?.field_1 || `Player ${String(play.userId).slice(0, 4)}`;
        bestByUser.set(play.userId, { name, score });
      }
    }

    const rows = [...bestByUser.values()]
      .sort((a, b) => b.score - a.score)
      .slice(0, 10)
      .map((row, i) => ({ rank: i + 1, ...row }));

    return { statusCode: 200, body: JSON.stringify({ rows }) };
  } catch (error) {
    // eslint-disable-next-line no-console
    console.error("Leaderboard error:", error);
    return {
      statusCode: 500,
      body: JSON.stringify({ error: "Something went wrong." }),
    };
  }
};
