// Frontend fetch helper — replaces old hono/client
const BASE = "";

async function get(path, params) {
  const url = new URL(path, typeof window !== "undefined" ? window.location.origin : "http://localhost:3000");
  if (params) {
    Object.entries(params).forEach(([k, v]) => v !== undefined && url.searchParams.set(k, String(v)));
  }
  const res = await fetch(url.toString());
  if (!res.ok) throw new Error(`API error ${res.status}: ${path}`);
  return res.json();
}

export const api = {
  tokens: {
    feed: () => get("/api/tokens/feed"),
    leaderboard: (params) => get("/api/tokens/leaderboard", params),
    trending: () => get("/api/tokens/trending"),
    fastestGrowing: (params) => get("/api/tokens/fastest-growing", params),
    new: (params) => get("/api/tokens/new", params),
    dumpers: (params) => get("/api/tokens/dumpers", params),
    profitable: (params) => get("/api/tokens/profitable", params),
    organic: () => get("/api/tokens/organic"),
    graduating: () => get("/api/tokens/graduating"),
    search: (q) => get("/api/tokens/search", { q }),
    detail: (mint) => get(`/api/tokens/${mint}`),
    priceHistory: (mint, window) => get(`/api/tokens/${mint}/price-history`, { window }),
  },
  analytics: {
    stats: () => get("/api/analytics/stats"),
    rugRadar: (params) => get("/api/analytics/rug-radar", params),
    devLeaderboard: () => get("/api/analytics/dev-leaderboard"),
    mostProfitable: (params) => get("/api/analytics/most-profitable", params),
    whales: (params) => get("/api/analytics/whales", params),
    smartMoney: () => get("/api/analytics/smart-money"),
    graduation: () => get("/api/analytics/graduation"),
    devTokens: (wallet) => get("/api/analytics/dev-tokens", { wallet }),
    community: () => get("/api/analytics/community"),
    trending: () => get("/api/analytics/trending"),
    copyTrade: () => get("/api/analytics/copy-trade"),
  },
  social: {
    buzz: (params) => get("/api/social/buzz", params),
    timeseries: (symbol) => get(`/api/social/timeseries/${symbol}`),
    token: (mint) => get(`/api/social/token/${mint}`),
  },
  portfolio: {
    get: (wallet) => get(`/api/portfolio/${wallet}`),
  },
};
