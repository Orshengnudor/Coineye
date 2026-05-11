import React, { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { TokenTable } from "../src/components/TokenRow";
import { PriceChart } from "../src/components/PriceChart";

export default function FastestGrowing() {
  const [timeframe, setTimeframe] = useState("24h");
  const [showAll, setShowAll] = useState(false);
  const { data, isLoading } = useQuery({
    queryKey: ["fastest-growing", timeframe],
    queryFn: async () => {
      const r = await fetch(`/api/tokens/fastest-growing?timeframe=${timeframe}`);
      const j = await r.json();
      return Array.isArray(j?.tokens) ? j.tokens : [];
    },
  });
  const allTokens = (data ?? []).map((t, i) => ({
    rank: i + 1, mint: t.mint, symbol: t.symbol ?? "???", name: t.name ?? t.symbol,
    price: t.price, priceChange24h: t.priceChange24h, volume24h: t.volume24h,
    marketCap: t.marketCap, image: t.image,
    score: Math.min(100, Math.max(0, Math.round(Math.abs(t.priceChange24h ?? 50)))),
  }));
  const tokens = showAll ? allTokens : allTokens.slice(0, 15);
  const chartData = allTokens.slice(0, 10).map((t) => ({ time: t.symbol, value: t.priceChange24h ?? 0 }));

  return (
    <div style={{ padding: "24px 28px", maxWidth: 1200 }}>
      <div style={{ marginBottom: 20 }}>
        <h1 style={{ fontFamily: "'Syne', sans-serif", fontSize: 22, fontWeight: 800, margin: 0 }}>
          ▲ Fastest <span style={{ color: "var(--accent)" }}>Growing</span>
        </h1>
        <div style={{ color: "var(--text-muted)", fontSize: 12, fontFamily: "'JetBrains Mono', monospace", marginTop: 4 }}>Tokens with highest price velocity</div>
      </div>
      <div className="filter-group" style={{ marginBottom: 16 }}>
        {["1h", "6h", "24h"].map((w) => (
          <button key={w} onClick={() => { setTimeframe(w); setShowAll(false); }} className={`filter-pill${timeframe === w ? " active" : ""}`}>{w}</button>
        ))}
      </div>
      {chartData.length > 0 && (
        <div style={{ background: "var(--surface)", border: "1px solid var(--border)", padding: 16, marginBottom: 16 }}>
          <div style={{ fontSize: 11, fontFamily: "'JetBrains Mono', monospace", color: "var(--text-muted)", marginBottom: 12, textTransform: "uppercase", letterSpacing: "0.08em" }}>Growth % — top 10</div>
          <PriceChart data={chartData} height={160} type="bar" label={`${timeframe} change %`} formatY={(v) => `${v.toFixed(0)}%`} formatTooltip={(v) => `${v.toFixed(2)}%`} />
        </div>
      )}
      <div style={{ background: "var(--surface)", border: "1px solid var(--border)" }}>
        <TokenTable tokens={tokens} columns={["rank", "name", "price", "change", "volume", "mcap", "score"]} headers={{ score: "Growth" }} loading={isLoading} emptyMsg="No growth data" />
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
