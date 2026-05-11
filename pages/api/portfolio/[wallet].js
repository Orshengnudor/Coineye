import { getWalletTokens } from "../../../src/lib/services/helius.js";
import { getTokenPrices, getSolPrice } from "../../../src/lib/services/jupiter.js";

export default async function handler(req, res) {
  if (req.method !== "GET") return res.status(405).json({ error: "Method not allowed" });

  const { wallet } = req.query;

  try {
    if (!wallet || wallet.length < 32) {
      return res.status(400).json({ error: "Invalid wallet address" });
    }

    const [tokens, solPrice] = await Promise.allSettled([
      getWalletTokens(wallet),
      getSolPrice(),
    ]);

    const tokenList = tokens.status === "fulfilled" ? tokens.value : [];
    const sol = solPrice.status === "fulfilled" ? solPrice.value : 150;

    const mints = tokenList.map((t) => t.mint).filter(Boolean).slice(0, 50);
    const prices = mints.length ? await getTokenPrices(mints) : {};

    const portfolio = tokenList
      .filter((t) => t.amount > 0)
      .map((t) => {
        const price = parseFloat(prices[t.mint]?.price || "0");
        const valueUsd = price * (t.uiAmount || 0);
        return {
          mint: t.mint,
          symbol: t.tokenAccount || t.symbol || "UNKNOWN",
          amount: t.uiAmount || 0,
          price,
          valueUsd,
        };
      })
      .filter((t) => t.valueUsd > 0.01)
      .sort((a, b) => b.valueUsd - a.valueUsd);

    const totalValueUsd = portfolio.reduce((s, t) => s + t.valueUsd, 0);

    return res.json({
      wallet,
      totalValueUsd,
      solPrice: sol,
      tokenCount: portfolio.length,
      tokens: portfolio,
      updatedAt: new Date().toISOString(),
    });
  } catch (e) {
    console.error("Portfolio API error:", e);
    return res.status(500).json({ error: e.message });
  }
}
