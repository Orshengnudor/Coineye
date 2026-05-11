import React, { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { TokenTable } from "../src/components/TokenRow";

export default function MostProfitable() {
  const [timeframe, setTimeframe] = useState("24h");
  const [showAll, setShowAll] = useState(false);
  const { data, isLoading } = useQuery({
    queryKey: ["profitable", timeframe],
    queryFn: async () => {
      const r = await fetch(`/api/tokens/profitable?timeframe=${timeframe}`);
      const j = await r.json();
      return Array.isArray(j?.data) ? j.data : [];
    },
  });
  const allTokens = (data ?? []).map((t, i) => ({
    rank: i + 1, mint: t.mint, symbol: t.symbol ?? "???", name: t.name ?? t.symbol,
    price: t.price, priceChange24h: t.priceChange24h, volume24h: t.volume24h,
    marketCap: t.marketCap, image: t.image,
  }));
  const tokens = showAll ? allTokens : allTokens.slice(0, 15);

  return (
    <div style={{ padding: "24px 28px", maxWidth: 1200 }}>
      <div style={{ marginBottom: 20 }}>
        <h1 style={{ fontFamily: "'Syne', sans-serif", fontSize: 22, fontWeight: 800, margin: 0 }}>
          ◉ Most <span style={{ color: "var(--accent)" }}>Profitable</span>
        </h1>
        <div style={{ color: "var(--text-muted)", fontSize: 12, fontFamily: "'JetBrains Mono', monospace", marginTop: 4 }}>Tokens with best returns in the selected timeframe</div>
      </div>
      <div className="filter-group" style={{ marginBottom: 16 }}>
        {["1h", "6h", "24h", "7d"].map((w) => (
          <button key={w} onClick={() => setTimeframe(w)} className={`filter-pill${timeframe === w ? " active" : ""}`}>{w}</button>
        ))}
      </div>
      <div className="card">
        <TokenTable tokens={tokens} columns={["rank", "name", "price", "change", "volume", "mcap"]} loading={isLoading} emptyMsg="No profitable tokens found" />
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
