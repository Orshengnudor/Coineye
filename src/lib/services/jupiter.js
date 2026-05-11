// Jupiter Price API — completely free, no auth required
const PRICE_API = "https://api.jup.ag/price/v2";

export async function getTokenPrices(mints) {
  try {
    if (!mints.length) return {};
    const ids = mints.slice(0, 100).join(",");
    const res = await fetch(`${PRICE_API}?ids=${ids}&showExtraInfo=true`);
    if (!res.ok) throw new Error(`Jupiter price error: ${res.status}`);
    const data = await res.json();
    return data.data || {};
  } catch (e) {
    console.error("Jupiter price error:", e);
    return {};
  }
}

export async function getSolPrice() {
  try {
    const SOL_MINT = "So11111111111111111111111111111111111111112";
    const res = await fetch(`${PRICE_API}?ids=${SOL_MINT}`);
    if (!res.ok) return 150;
    const data = await res.json();
    return parseFloat(data.data?.[SOL_MINT]?.price || "150");
  } catch {
    return 150;
  }
}
