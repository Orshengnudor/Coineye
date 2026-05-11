import React, { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import Link from "next/link";
import { StatCard } from "../src/components/StatCard";

function RiskBar({ score }) {
  const color = score >= 80 ? "var(--red)" : score >= 50 ? "var(--yellow)" : "var(--accent)";
  return (
    <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
      <div style={{ flex: 1, height: 4, background: "var(--border)" }}>
        <div style={{ height: "100%", width: `${score}%`, background: color }} />
      </div>
      <span style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: 11, color, minWidth: 26, textAlign: "right" }}>{score}</span>
    </div>
  );
}

function fmt(n) {
  if (!n) return "—";
  if (n >= 1e6) return `$${(n / 1e6).toFixed(1)}M`;
  if (n >= 1e3) return `$${(n / 1e3).toFixed(0)}K`;
  return `$${n.toFixed(0)}`;
}

export default function Ruggers() {
  const [threshold, setThreshold] = useState(50);
  const [showAll, setShowAll] = useState(false);
  const { data, isLoading, isFetching, refetch } = useQuery({
    queryKey: ["ruggers", threshold],
    queryFn: async () => {
      const r = await fetch(`/api/analytics/rug-radar?minScore=${threshold}`);
      const j = await r.json();
      return Array.isArray(j?.data) ? j.data : [];
    },
    refetchInterval: 60000,
  });
  const tokens = data ?? [];
  const displayed = showAll ? tokens : tokens.slice(0, 15);
  const critical = tokens.filter((t) => t.riskScore >= 80).length;
  const medium = tokens.filter((t) => t.riskScore >= 50 && t.riskScore < 80).length;

  return (
    <div style={{ padding: "24px 28px", maxWidth: 1300 }}>
      <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", marginBottom: 20 }}>
        <div>
          <h1 style={{ fontFamily: "'Syne', sans-serif", fontSize: 22, fontWeight: 800, margin: 0 }}>
            ⚠ Rugger <span style={{ color: "var(--red)" }}>Radar</span>
          </h1>
          <div style={{ color: "var(--text-muted)", fontSize: 12, fontFamily: "'JetBrains Mono', monospace", marginTop: 4 }}>Tokens with on-chain rug signals</div>
        </div>
        <button onClick={() => refetch()} style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: 11, padding: "6px 12px", background: "transparent", border: "1px solid #38bdf8", color: "#38bdf8", cursor: "pointer" }}>
          <span className={isFetching ? "spin" : ""}>↻</span>
        </button>
      </div>
      <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 1, marginBottom: 20, border: "1px solid var(--border)" }}>
        <StatCard label="Critical Risk" value={critical} sub="score ≥ 80" />
        <StatCard label="Medium Risk" value={medium} sub="50–79" />
        <StatCard label="Total Flagged" value={tokens.length} icon="⚠" />
      </div>
      <div className="filter-group" style={{ marginBottom: 16 }}>
        {[50, 70, 90].map((t) => (
          <button key={t} onClick={() => setThreshold(t)} className={`filter-pill${threshold === t ? " active" : ""}`}>Score ≥ {t}</button>
        ))}
      </div>
      <div style={{ background: "var(--surface)", border: "1px solid var(--border)" }}>
        <div style={{ display: "grid", gridTemplateColumns: "36px 1fr 130px 90px 90px 80px 160px", gap: 0, padding: "8px 12px", borderBottom: "1px solid var(--border)" }}>
          {["#", "Token", "Risk Score", "Price Δ 24h", "Liq.", "Sell%", "Flags"].map((h) => (
            <div key={h} style={{ fontSize: 10, fontFamily: "'JetBrains Mono', monospace", color: "var(--text-muted)", textTransform: "uppercase", letterSpacing: "0.08em" }}>{h}</div>
          ))}
        </div>
        {isLoading ? (
          Array.from({ length: 8 }).map((_, i) => (
            <div key={i} style={{ padding: "12px", borderBottom: "1px solid var(--border)", height: 48 }}>
              <div style={{ height: 12, width: "80%", background: "var(--surface-raised)" }} />
            </div>
          ))
        ) : displayed.length === 0 ? (
          <div style={{ padding: 40, textAlign: "center", color: "var(--text-muted)", fontFamily: "'JetBrains Mono', monospace", fontSize: 13 }}>No rug alerts at this threshold</div>
        ) : (
          displayed.map((t, i) => (
            <div key={t.mint ?? i} style={{ display: "grid", gridTemplateColumns: "36px 1fr 130px 90px 90px 80px 160px", gap: 0, padding: "10px 12px", borderBottom: "1px solid var(--border)", alignItems: "center" }}
              onMouseEnter={(e) => (e.currentTarget.style.background = "var(--surface-raised)")}
              onMouseLeave={(e) => (e.currentTarget.style.background = "transparent")}
            >
              <div style={{ color: "var(--text-muted)", fontFamily: "'JetBrains Mono', monospace", fontSize: 12 }}>{i + 1}</div>
              <Link href={`/token/${t.mint}`}>
                <div style={{ display: "flex", alignItems: "center", gap: 8, cursor: "pointer" }}>
                  {t.image ? (
                    <img src={t.image} alt="" style={{ width: 26, height: 26, borderRadius: 2, objectFit: "cover" }} onError={(e) => { e.target.style.display = "none"; }} />
                  ) : (
                    <div style={{ width: 26, height: 26, background: "rgba(255,59,59,0.1)", border: "1px solid var(--red)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 9, color: "var(--red)", fontFamily: "'JetBrains Mono', monospace" }}>
                      {t.symbol?.slice(0, 3) ?? "??"}
                    </div>
                  )}
                  <div>
                    <div style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: 13, fontWeight: 600 }}>{t.symbol}</div>
                    <div style={{ fontSize: 10, color: "var(--text-muted)" }}>{t.name?.slice(0, 18)}</div>
                  </div>
                </div>
              </Link>
              <RiskBar score={t.riskScore ?? 0} />
              <div style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: 12, color: (t.priceChange24h ?? 0) < 0 ? "var(--red)" : "var(--accent)" }}>
                {(t.priceChange24h ?? 0) > 0 ? "+" : ""}{(t.priceChange24h ?? 0).toFixed(1)}%
              </div>
              <div style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: 12, color: "var(--text-muted)" }}>{fmt(t.liquidity)}</div>
              <div style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: 12, color: (t.sellPressure ?? 0) > 60 ? "var(--red)" : "var(--text-muted)" }}>
                {t.sellPressure ? `${t.sellPressure}%` : "—"}
              </div>
              <div style={{ display: "flex", gap: 3, flexWrap: "wrap" }}>
                {(t.flags ?? []).slice(0, 3).map((f) => (
                  <span key={f} style={{ fontSize: 8, fontFamily: "'JetBrains Mono', monospace", padding: "1px 4px", background: "rgba(255,59,59,0.1)", border: "1px solid var(--red)", color: "var(--red)" }}>{f}</span>
                ))}
              </div>
            </div>
          ))
        )}
        {!isLoading && tokens.length > 15 && (
          <div style={{ padding: "12px", borderTop: "1px solid var(--border)", textAlign: "center" }}>
            <button className="show-more-btn" onClick={() => setShowAll(!showAll)}>
              {showAll ? "← Show Less" : `See All ${tokens.length} Flagged ↓`}
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
