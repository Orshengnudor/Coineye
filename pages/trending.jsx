import React, { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import Link from "next/link";
import { StatCard } from "../src/components/StatCard";

function fmt(n) {
  if (!n) return "—";
  if (n >= 1e9) return `$${(n / 1e9).toFixed(2)}B`;
  if (n >= 1e6) return `$${(n / 1e6).toFixed(1)}M`;
  if (n >= 1e3) return `$${(n / 1e3).toFixed(0)}K`;
  return `$${n.toFixed(2)}`;
}

export default function TrendingNow() {
  const [showAll, setShowAll] = useState(false);
  const { data, isLoading, isFetching, refetch } = useQuery({
    queryKey: ["trending-analytics"],
    queryFn: async () => {
      const r = await fetch("/api/analytics/trending");
      const j = await r.json();
      return Array.isArray(j?.data) ? j.data : [];
    },
    refetchInterval: 30000,
  });
  const tokens = data ?? [];
  const displayed = showAll ? tokens : tokens.slice(0, 20);

  return (
    <div style={{ padding: "24px 28px", maxWidth: 1200 }}>
      <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", marginBottom: 20 }}>
        <div>
          <h1 style={{ fontFamily: "'Syne', sans-serif", fontSize: 22, fontWeight: 800, margin: 0 }}>
            🔥 <span style={{ color: "var(--accent)" }}>Trending Now</span>
          </h1>
          <div style={{ color: "var(--text-muted)", fontSize: 12, fontFamily: "'JetBrains Mono', monospace", marginTop: 4 }}>
            Real-time top movers by volume, price change & holder growth
          </div>
        </div>
        <div style={{ display: "flex", gap: 8, alignItems: "center" }}>
          <span className="pulse-dot" style={{ width: 6, height: 6 }} />
          <span style={{ fontSize: 10, color: "var(--text-faint)", fontFamily: "'JetBrains Mono', monospace" }}>Live · 30s</span>
          <button onClick={() => refetch()} style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: 11, padding: "6px 12px", background: "transparent", border: "1px solid #38bdf8", color: "#38bdf8", cursor: "pointer" }}>
            <span className={isFetching ? "spin" : ""}>↻</span>
          </button>
        </div>
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 1, marginBottom: 20, border: "1px solid var(--border)" }}>
        <StatCard label="Tokens Tracked" value={tokens.length} />
        <StatCard label="Top Gainer 24h" value={tokens[0] ? `+${tokens[0].priceChange24h?.toFixed(1)}%` : "—"} accent />
        <StatCard label="Avg Volume" value={fmt(tokens.reduce((a, t) => a + (t.volume24h ?? 0), 0) / (tokens.length || 1))} />
      </div>

      {isLoading ? (
        <div style={{ color: "var(--text-muted)", fontFamily: "'JetBrains Mono', monospace", fontSize: 12, padding: 24 }}>Loading...</div>
      ) : (
        <>
          <div style={{ border: "1px solid var(--border)" }}>
            <div style={{ display: "grid", gridTemplateColumns: "36px 36px 1fr 90px 90px 90px 110px 110px", padding: "8px 12px", borderBottom: "1px solid var(--border)", fontFamily: "'JetBrains Mono', monospace", fontSize: 10, color: "var(--text-faint)", gap: 8, textTransform: "uppercase", letterSpacing: "0.06em" }}>
              {["#", "", "Token", "Price", "Δ 24h", "Volume", "MCap", "Holders"].map((h) => <span key={h}>{h}</span>)}
            </div>
            {displayed.map((t, i) => (
              <Link key={t.mint} href={`/token/${t.mint}`}>
                <div style={{ display: "grid", gridTemplateColumns: "36px 36px 1fr 90px 90px 90px 110px 110px", padding: "10px 12px", borderBottom: "1px solid var(--border)", fontFamily: "'JetBrains Mono', monospace", fontSize: 12, alignItems: "center", gap: 8, cursor: "pointer" }}
                  onMouseEnter={(e) => (e.currentTarget.style.background = "var(--surface-raised)")}
                  onMouseLeave={(e) => (e.currentTarget.style.background = "transparent")}
                >
                  <span style={{ color: "var(--text-faint)" }}>#{i + 1}</span>
                  <div>
                    {t.image ? (
                      <img src={t.image} alt="" style={{ width: 28, height: 28, borderRadius: "50%", objectFit: "cover" }} onError={(e) => (e.currentTarget.style.display = "none")} />
                    ) : (
                      <div style={{ width: 28, height: 28, borderRadius: "50%", background: "var(--border)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 10 }}>{t.symbol?.[0]}</div>
                    )}
                  </div>
                  <div>
                    <div style={{ fontWeight: 600, color: "var(--text)" }}>{t.symbol}</div>
                    <div style={{ color: "var(--text-faint)", fontSize: 10, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap", maxWidth: 140 }}>{t.name}</div>
                  </div>
                  <span style={{ color: "var(--text-muted)" }}>{t.price < 0.0001 ? `$${t.price?.toExponential(2)}` : `$${t.price?.toFixed(4) ?? "—"}`}</span>
                  <span style={{ color: (t.priceChange24h ?? 0) >= 0 ? "var(--green)" : "var(--red)", fontWeight: 600 }}>
                    {(t.priceChange24h ?? 0) >= 0 ? "+" : ""}{(t.priceChange24h ?? 0).toFixed(1)}%
                  </span>
                  <span style={{ color: "var(--text-muted)" }}>{fmt(t.volume24h)}</span>
                  <span style={{ color: "var(--text-muted)" }}>{fmt(t.marketCap)}</span>
                  <span style={{ color: "var(--text-muted)" }}>{(t.holderCount ?? 0).toLocaleString()}</span>
                </div>
              </Link>
            ))}
          </div>
          {tokens.length > 20 && (
            <div style={{ textAlign: "center", marginTop: 1 }}>
              <button className="show-more-btn" onClick={() => setShowAll(!showAll)}>
                {showAll ? "▲ Show Less" : `▼ Show All ${tokens.length} Tokens`}
              </button>
            </div>
          )}
        </>
      )}
    </div>
  );
}
