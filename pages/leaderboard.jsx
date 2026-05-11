import React, { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { TokenTable } from "../src/components/TokenRow";

export default function Leaderboard() {
  const [range, setRange] = useState("24h");
  const [sortBy, setSortBy] = useState("volume");
  const [showAll, setShowAll] = useState(false);

  const { data: raw, isLoading } = useQuery({
    queryKey: ["leaderboard", range, sortBy],
    queryFn: async () => {
      const r = await fetch(`/api/tokens/leaderboard?timeframe=${range}&sortBy=${sortBy}`);
      return r.json();
    },
  });

  const allTokens = ((raw?.leaderboard ?? raw?.data ?? (Array.isArray(raw) ? raw : [])))
    .map((t, i) => ({
      rank: i + 1, mint: t.mint, symbol: t.symbol ?? "???", name: t.name ?? t.symbol,
      price: t.price, priceChange24h: t.priceChange24h, volume24h: t.volume24h,
      marketCap: t.marketCap, liquidity: t.liquidity, holders: t.holderCount ?? t.holders, image: t.image,
    }));
  const tokens = showAll ? allTokens : allTokens.slice(0, 15);

  return (
    <div style={{ padding: "24px 28px", maxWidth: 1200 }}>
      <div style={{ marginBottom: 20 }}>
        <h1 style={{ fontFamily: "'Syne', sans-serif", fontSize: 22, fontWeight: 800, margin: 0 }}>
          ◉ <span style={{ color: "var(--accent)" }}>Leaderboard</span>
        </h1>
        <div style={{ color: "var(--text-muted)", fontSize: 12, fontFamily: "'JetBrains Mono', monospace", marginTop: 4 }}>
          Top-ranked Solana tokens by performance metrics
        </div>
      </div>
      <div style={{ display: "flex", gap: 8, marginBottom: 16, flexWrap: "wrap" }}>
        <div className="filter-group">
          {["1h", "6h", "24h", "7d"].map((r) => (
            <button key={r} onClick={() => { setRange(r); setShowAll(false); }} className={`filter-pill${range === r ? " active" : ""}`}>{r}</button>
          ))}
        </div>
        <div className="filter-group">
          {["volume", "mcap", "change", "holders"].map((s) => (
            <button key={s} onClick={() => { setSortBy(s); setShowAll(false); }} className={`filter-pill${sortBy === s ? " active" : ""}`}>{s}</button>
          ))}
        </div>
      </div>
      <div className="card">
        <TokenTable tokens={tokens} columns={["rank", "name", "price", "change", "volume", "mcap", "liquidity", "holders"]} loading={isLoading} emptyMsg="No leaderboard data" />
      </div>
      {allTokens.length > 15 && (
        <div style={{ textAlign: "center", marginTop: 12 }}>
          <button className="show-more-btn" onClick={() => setShowAll((v) => !v)}>
            {showAll ? `▲ Show Less` : `▼ See More (${allTokens.length - 15} more)`}
          </button>
        </div>
      )}
    </div>
  );
}
