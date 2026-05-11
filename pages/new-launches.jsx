import React, { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import Link from "next/link";
import { StatCard } from "../src/components/StatCard";

function fmt(n, prefix = "$") {
  if (!n) return "—";
  if (n >= 1e6) return `${prefix}${(n / 1e6).toFixed(2)}M`;
  if (n >= 1e3) return `${prefix}${(n / 1e3).toFixed(1)}K`;
  return `${prefix}${n.toFixed(4)}`;
}

export default function NewLaunches() {
  const [filter, setFilter] = useState("all");
  const [showAll, setShowAll] = useState(false);
  const { data, isLoading, isFetching, refetch } = useQuery({
    queryKey: ["new-launches", filter],
    queryFn: async () => {
      const r = await fetch(`/api/tokens/new?filter=${filter}`);
      const j = await r.json();
      return Array.isArray(j?.data) ? j.data : [];
    },
    refetchInterval: 30000,
  });
  const tokens = data ?? [];
  const displayed = showAll ? tokens : tokens.slice(0, 15);

  return (
    <div style={{ padding: "24px 28px", maxWidth: 1300 }}>
      <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", marginBottom: 20 }}>
        <div>
          <h1 style={{ fontFamily: "'Syne', sans-serif", fontSize: 22, fontWeight: 800, margin: 0 }}>
            ◎ New <span style={{ color: "var(--accent)" }}>Launches</span>
          </h1>
          <div style={{ color: "var(--text-muted)", fontSize: 12, fontFamily: "'JetBrains Mono', monospace", marginTop: 4 }}>Newest Solana token pairs — sorted by launch time</div>
        </div>
        <button onClick={() => refetch()} style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: 11, padding: "6px 12px", background: "transparent", border: "1px solid #38bdf8", color: "#38bdf8", cursor: "pointer" }}>
          <span className={isFetching ? "spin" : ""}>↻</span> Refresh
        </button>
      </div>
      <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 1, marginBottom: 20, border: "1px solid var(--border)" }}>
        <StatCard label="Total Found" value={tokens.length} icon="◎" />
        <StatCard label="Graduating" value={tokens.filter(t => (t.bondingCurve ?? 0) >= 80 && !t.isGraduated).length} icon="⬆" />
        <StatCard label="Graduated" value={tokens.filter(t => t.isGraduated).length} icon="✓" />
      </div>
      <div className="filter-group" style={{ marginBottom: 16 }}>
        {["all", "verified", "risky", "graduating", "graduated"].map((f) => (
          <button key={f} onClick={() => setFilter(f)} className={`filter-pill${filter === f ? " active" : ""}`} style={{ textTransform: "capitalize" }}>{f}</button>
        ))}
      </div>
      <div style={{ background: "var(--surface)", border: "1px solid var(--border)" }}>
        <div style={{ display: "grid", gridTemplateColumns: "36px 1fr 110px 90px 100px 100px 70px 80px", gap: 0, padding: "8px 12px", borderBottom: "1px solid var(--border)" }}>
          {["#", "Token", "Price", "1h%", "24h%", "Volume", "Age", "Status"].map((h) => (
            <div key={h} style={{ fontSize: 10, fontFamily: "'JetBrains Mono', monospace", color: "var(--text-muted)", textTransform: "uppercase", letterSpacing: "0.08em" }}>{h}</div>
          ))}
        </div>
        {isLoading ? (
          Array.from({ length: 8 }).map((_, i) => (
            <div key={i} style={{ padding: "12px", borderBottom: "1px solid var(--border)", height: 44 }}>
              <div style={{ height: 12, width: "80%", background: "var(--surface-raised)", borderRadius: 2 }} />
            </div>
          ))
        ) : displayed.length === 0 ? (
          <div style={{ padding: 40, textAlign: "center", color: "var(--text-muted)", fontFamily: "'JetBrains Mono', monospace", fontSize: 13 }}>No tokens found — Bags.fm API may be unavailable</div>
        ) : (
          displayed.map((t, i) => (
            <div key={t.mint ?? i} style={{ display: "grid", gridTemplateColumns: "36px 1fr 110px 90px 100px 100px 70px 80px", gap: 0, padding: "10px 12px", borderBottom: "1px solid var(--border)", alignItems: "center" }}
              onMouseEnter={(e) => (e.currentTarget.style.background = "var(--surface-raised)")}
              onMouseLeave={(e) => (e.currentTarget.style.background = "transparent")}
            >
              <div style={{ color: "var(--text-muted)", fontFamily: "'JetBrains Mono', monospace", fontSize: 12 }}>{i + 1}</div>
              <Link href={`/token/${t.mint}`}>
                <div style={{ display: "flex", alignItems: "center", gap: 8, cursor: "pointer" }}>
                  {t.image ? (
                    <img src={t.image} alt="" style={{ width: 26, height: 26, borderRadius: 2, objectFit: "cover" }} onError={(e) => { e.target.style.display = "none"; }} />
                  ) : (
                    <div style={{ width: 26, height: 26, background: "var(--surface-raised)", border: "1px solid var(--border)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 9, fontFamily: "'JetBrains Mono', monospace", color: "var(--accent)" }}>
                      {t.symbol?.slice(0, 3) ?? "??"}
                    </div>
                  )}
                  <div>
                    <div style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: 13, fontWeight: 600 }}>{t.symbol} <span style={{ fontSize: 8, padding: "1px 4px", background: "var(--accent)", color: "#000", fontWeight: 700 }}>BAGS</span></div>
                    <div style={{ fontSize: 10, color: "var(--text-muted)" }}>{t.name?.slice(0, 16)}</div>
                  </div>
                </div>
              </Link>
              <div style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: 12 }}>{fmt(t.price)}</div>
              <div style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: 12, color: (t.priceChange1h ?? 0) >= 0 ? "var(--accent)" : "var(--red)" }}>{(t.priceChange1h ?? 0) >= 0 ? "+" : ""}{(t.priceChange1h ?? 0).toFixed(1)}%</div>
              <div style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: 12, color: (t.priceChange24h ?? 0) >= 0 ? "var(--accent)" : "var(--red)" }}>{(t.priceChange24h ?? 0) >= 0 ? "+" : ""}{(t.priceChange24h ?? 0).toFixed(1)}%</div>
              <div style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: 12, color: "var(--text-muted)" }}>{fmt(t.volume24h)}</div>
              <div style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: 12, color: "var(--text-muted)" }}>{t.age ?? "—"}</div>
              <div>
                {t.isGraduated ? (
                  <span style={{ fontSize: 9, fontFamily: "'JetBrains Mono', monospace", padding: "2px 5px", border: "1px solid var(--accent)", color: "var(--accent)" }}>GRAD</span>
                ) : (
                  <span style={{ fontSize: 9, fontFamily: "'JetBrains Mono', monospace", padding: "2px 5px", border: "1px solid #38bdf8", color: "#38bdf8" }}>NEW</span>
                )}
              </div>
            </div>
          ))
        )}
        {!isLoading && tokens.length > 15 && (
          <div style={{ padding: "12px", borderTop: "1px solid var(--border)", textAlign: "center" }}>
            <button className="show-more-btn" onClick={() => setShowAll(!showAll)}>
              {showAll ? "← Show Less" : `See All ${tokens.length} Tokens ↓`}
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
