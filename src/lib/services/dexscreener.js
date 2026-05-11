// DexScreener API — completely free, no auth required
const BASE = "https://api.dexscreener.com";

export async function getTrendingTokensSolana() {
  try {
    const res = await fetch(`${BASE}/token-boosts/top/v1`, {
      headers: { "Accept": "application/json" }
    });
    if (!res.ok) throw new Error(`DexScreener ${res.status}`);
    const data = await res.json();
    const items = Array.isArray(data) ? data : [];
    const solanaBoosted = items.filter((t) => t.chainId === "solana").slice(0, 20);
    if (solanaBoosted.length === 0) return [];
    const mints = solanaBoosted.map((t) => t.tokenAddress).join(",");
    const pairRes = await fetch(`${BASE}/tokens/v1/solana/${mints}`);
    if (!pairRes.ok) return [];
    const pairs = await pairRes.json();
    return Array.isArray(pairs) ? pairs.filter((p) => p.chainId === "solana") : [];
  } catch (e) {
    console.error("DexScreener trending error:", e);
    return [];
  }
}

export async function getLatestTokensSolana() {
  try {
    const res = await fetch(`${BASE}/token-profiles/latest/v1`);
    if (!res.ok) throw new Error(`DexScreener ${res.status}`);
    const data = await res.json();
    const items = Array.isArray(data) ? data : [];
    const solanaItems = items.filter((t) => t.chainId === "solana").slice(0, 20);
    if (solanaItems.length === 0) return [];
    const mints = solanaItems.map((t) => t.tokenAddress).join(",");
    const pairRes = await fetch(`${BASE}/tokens/v1/solana/${mints}`);
    if (!pairRes.ok) return [];
    const pairs = await pairRes.json();
    return Array.isArray(pairs) ? pairs.filter((p) => p.chainId === "solana") : [];
  } catch (e) {
    console.error("DexScreener latest error:", e);
    return [];
  }
}

export async function searchTokensSolana(query) {
  try {
    const res = await fetch(`${BASE}/latest/dex/search?q=${encodeURIComponent(query)}`);
    if (!res.ok) throw new Error(`DexScreener ${res.status}`);
    const data = await res.json();
    return data.pairs?.filter((p) => p.chainId === "solana") || [];
  } catch (e) {
    console.error("DexScreener search error:", e);
    return [];
  }
}

export async function getTokenByMint(mint) {
  try {
    const res = await fetch(`${BASE}/tokens/v1/solana/${mint}`);
    if (!res.ok) throw new Error(`DexScreener ${res.status}`);
    const data = await res.json();
    return Array.isArray(data) ? data : [];
  } catch (e) {
    console.error("DexScreener token error:", e);
    return [];
  }
}
