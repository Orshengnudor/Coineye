import React, { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { TokenTable } from "../src/components/TokenRow";

export default function OrganicTrades() {
  const [showAll, setShowAll] = useState(false);
  const { data, isLoading } = useQuery({
    queryKey: ["organic"],
    queryFn: async () => {
      const r = await fetch("/api/tokens/organic");
      const j = await r.json();
      return Array.isArray(j?.data) ? j.data : [];
    },
  });
  const allTokens = (data ?? []).map((t, i) => ({
    rank: i + 1, mint: t.mint, symbol: t.symbol ?? "???", name: t.name ?? t.symbol,
    price: t.price, priceChange24h: t.priceChange24h, volume24h: t.volume24h,
    marketCap: t.marketCap, image: t.image,
    score: Math.round(t.organicRatio ?? t.organicScore ?? 0),
  }));
  const tokens = showAll ? allTokens : allTokens.slice(0, 15);

  return (
    <div style={{ padding: "24px 28px", maxWidth: 1200 }}>
      <div style={{ marginBottom: 20 }}>
        <h1 style={{ fontFamily: "'Syne', sans-serif", fontSize: 22, fontWeight: 800, margin: 0 }}>
          ◍ Organic <span style={{ color: "var(--accent)" }}>Trades</span>
        </h1>
        <div style={{ color: "var(--text-muted)", fontSize: 12, fontFamily: "'JetBrains Mono', monospace", marginTop: 4 }}>Highest organic buy ratio — real trading, no bots</div>
      </div>
      <div className="card">
        <TokenTable tokens={tokens} columns={["rank", "name", "price", "change", "volume", "mcap", "score"]} headers={{ score: "Organic%" }} loading={isLoading} emptyMsg="No organic data" />
      </div>
      {allTokens.length > 15 && (
        <div style={{ textAlign: "center", marginTop: 12 }}>
          <button className="show-more-btn" onClick={() => setShowAll((v) => !v)}>
            {showAll ? `▲ Show Less` : `▼ See More`}
          </button>
        </div>
      )}
    </div>
  );
}
