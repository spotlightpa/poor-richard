export default function gameLeaderboard(series) {
  return {
    rows: [],
    loading: true,
    async init() {
      try {
        let resp = await fetch(
          `/.netlify/functions/leaderboard?series=${encodeURIComponent(series)}`,
        );
        let data = await resp.json();
        this.rows = data.rows || [];
      } catch (e) {
        // eslint-disable-next-line no-console
        console.warn(e);
      } finally {
        this.loading = false;
      }
    },
  };
}
