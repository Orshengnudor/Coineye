import React, { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import Link from "next/link";
import { StatCard } from "../src/components/StatCard";

function fmt(n, pre = "$") {
  if (!n) return "—";
  if (n >= 1e6) return `${pre}${(n / 1e6).toFixed(2)}M`;
  if (n >= 1e3) return `${pre}${(n / 1e3).toFixed(1)}K`;
  return `${pre}${n.toFixed(2)}`;
}

export default function DumpDetector() {
  const [timeframe, setTimeframe] = useState("24h");
  const [showAll, setShowAll] = useState(false);
  const { data, isLoading, isFetching, refetch } = useQuery({
    queryKey: ["dumpers", timeframe],
    queryFn: async () => {
      const r = await fetch(`/api/tokens/dumpers?timeframe=${timeframe}`);
      const j = await r.json();
      return Array.isArray(j?.data) ? j.data : [];
    },
    refetchInterval: 30000,
  });
  const tokens = data ?? [];
  const displayed = showAll ? tokens : tokens.slice(0, 15);
  const severe = tokens.filter((t) => (t.priceChange24h ?? 0) < -70).length;
  const dumps = tokens.filter((t) => (t.priceChange24h ?? 0) < -40).length;

  return (
    <div style={{ padding: "24px 28px", maxWidth: 1300 }}>
      <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", marginBottom: 20 }}>
        <div>
          <h1 style={{ fontFamily: "'Syne', sans-serif", fontSize: 22, fontWeight: 800, margin: 0 }}>
            ▼ Dump <span style={{ color: "var(--red)" }}>Detector</span>
          </h1>
          <div style={{ color: "var(--text-muted)", fontSize: 12, fontFamily: "'JetBrains Mono', monospace", marginTop: 4 }}>Tokens with aggressive sell pressure and downward price action</div>
        </div>
        <button onClick={() => refetch()} style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: 11, padding: "6px 12px", background: "transparent", border: "1px solid #38bdf8", color: "#38bdf8", cursor: "pointer" }}>
          <span className={isFetching ? "spin" : ""}>↻</span>
        </button>
      </div>
      <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 1, marginBottom: 20, border: "1px solid var(--border)" }}>
        <StatCard label="Severe (-70%+)" value={severe} />
        <StatCard label="Dumping (-40%+)" value={dumps} />
        <StatCard label="Total Tracked" value={tokens.length} />
      </div>
      <div className="filter-group" style={{ marginBottom: 16 }}>
        {["1h", "4h", "24h"].map((w) => (
          <button key={w} onClick={() => setTimeframe(w)} className={`filter-pill${timeframe === w ? " active" : ""}`}>{w}</button>
        ))}
      </div>
      <div style={{ background: "var(--surface)", border: "1px solid var(--border)" }}>
        <div style={{ display: "grid", gridTemplateColumns: "36px 1fr 110px 110px 110px 120px 100px", gap: 0, padding: "8px 12px", borderBottom: "1px solid var(--border)" }}>
          {["#", "Token", "Price", "Change", "Volume", "Sell Pressure", "Liquidity"].map((h) => (
            <div key={h} style={{ fontSize: 10, fontFamily: "'JetBrains Mono', monospace", color: "var(--text-muted)", textTransform: "uppercase", letterSpacing: "0.08em" }}>{h}</div>
          ))}
        </div>
        {isLoading ? (
          Array.from({ length: 8 }).map((_, i) => (
            <div key={i} style={{ padding: "12px", borderBottom: "1px solid var(--border)", height: 48 }}>
              <div style={{ height: 12, background: "var(--surface-raised)", width: "80%" }} />
            </div>
          ))
        ) : displayed.length === 0 ? (
          <div style={{ padding: 40, textAlign: "center", color: "var(--text-muted)", fontFamily: "'JetBrains Mono', monospace", fontSize: 13 }}>No dump signals for this window</div>
        ) : (
          displayed.map((t, i) => (
            <div key={t.mint ?? i} style={{ display: "grid", gridTemplateColumns: "36px 1fr 110px 110px 110px 120px 100px", gap: 0, padding: "10px 12px", borderBottom: "1px solid var(--border)", alignItems: "center" }}
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
                    <div style={{ fontSize: 10, color: "var(--text-muted)" }}>{t.name?.slice(0, 16)}</div>
                  </div>
                </div>
              </Link>
              <div style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: 12 }}>${t.price?.toFixed(6) ?? "—"}</div>
              <div style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: 13, fontWeight: 600, color: "var(--red)" }}>
                {(t.priceChange24h ?? 0).toFixed(1)}%
              </div>
              <div style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: 12, color: "var(--text-muted)" }}>{fmt(t.volume24h)}</div>
              <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
                <div style={{ flex: 1, height: 4, background: "var(--border)" }}>
                  <div style={{ height: "100%", width: `${Math.min(100, t.sellPressure ?? 0)}%`, background: (t.sellPressure ?? 0) > 70 ? "var(--red)" : "var(--yellow)" }} />
                </div>
                <span style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: 11, color: (t.sellPressure ?? 0) > 70 ? "var(--red)" : "var(--text-muted)", minWidth: 30 }}>{(t.sellPressure ?? 0).toFixed(0)}%</span>
              </div>
              <div style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: 12, color: (t.liquidity ?? 0) < 1000 ? "var(--red)" : "var(--text-muted)" }}>{fmt(t.liquidity)}</div>
            </div>
          ))
        )}
        {!isLoading && tokens.length > 15 && (
          <div style={{ padding: "12px", borderTop: "1px solid var(--border)", textAlign: "center" }}>
            <button className="show-more-btn" onClick={() => setShowAll(!showAll)}>
              {showAll ? "← Show Less" : `See All ${tokens.length} Dumping Tokens ↓`}
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
