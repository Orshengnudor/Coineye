import React, { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import Link from "next/link";
import { StatCard } from "../src/components/StatCard";

function fmt(n) {
  if (!n) return "—";
  if (n >= 1e9) return `$${(n / 1e9).toFixed(2)}B`;
  if (n >= 1e6) return `$${(n / 1e6).toFixed(2)}M`;
  if (n >= 1e3) return `$${(n / 1e3).toFixed(0)}K`;
  return `$${n.toFixed(0)}`;
}

export default function WhaleWatch() {
  const [minUsd, setMinUsd] = useState(500);
  const [filter, setFilter] = useState("all");

  const { data, isLoading } = useQuery({
    queryKey: ["whales", minUsd, filter],
    queryFn: async () => {
      const r = await fetch(`/api/analytics/whales?type=${filter}&minUsd=${minUsd}`);
      const j = await r.json();
      return Array.isArray(j?.whales) ? j.whales : [];
    },
    refetchInterval: 30000,
  });

  const whales = data ?? [];
  const totalVol = whales.reduce((a, t) => a + (t.organicBuyVolume ?? t.valueUsd ?? 0), 0);

  return (
    <div style={{ padding: "24px 28px", maxWidth: 1300 }}>
      <div style={{ marginBottom: 20 }}>
        <h1 style={{ fontFamily: "'Syne', sans-serif", fontSize: 22, fontWeight: 800, margin: 0 }}>
          ◆ Whale <span style={{ color: "var(--blue)" }}>Watch</span>
        </h1>
        <div style={{ color: "var(--text-muted)", fontSize: 12, fontFamily: "'JetBrains Mono', monospace", marginTop: 4 }}>Top wallet holders & large token movements on Solana</div>
      </div>
      <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 1, marginBottom: 20, border: "1px solid var(--border)" }}>
        <StatCard label="Total Volume" value={fmt(totalVol)} icon="◆" />
        <StatCard label="Tokens Tracked" value={whales.length} />
        <StatCard label="Min USD Filter" value={`$${minUsd}`} />
      </div>
      <div style={{ display: "flex", gap: 8, marginBottom: 16, flexWrap: "wrap" }}>
        <div className="filter-group">
          {["all", "buy", "sell"].map((f) => (
            <button key={f} onClick={() => setFilter(f)} className={`filter-pill${filter === f ? " active" : ""}`}>{f.toUpperCase()}</button>
          ))}
        </div>
        <div className="filter-group">
          {[100, 500, 1000, 5000, 10000].map((v) => (
            <button key={v} onClick={() => setMinUsd(v)} className={`filter-pill${minUsd === v ? " active" : ""}`}>{v >= 1000 ? `${(v / 1000).toFixed(0)}K+` : `${v}+`}</button>
          ))}
        </div>
      </div>
      <div style={{ background: "var(--surface)", border: "1px solid var(--border)" }}>
        {isLoading ? (
          <div style={{ padding: 24, textAlign: "center", color: "var(--text-muted)", fontFamily: "'JetBrains Mono', monospace", fontSize: 12 }}>Loading...</div>
        ) : whales.length === 0 ? (
          <div style={{ padding: 40, textAlign: "center", color: "var(--text-muted)", fontFamily: "'JetBrains Mono', monospace", fontSize: 13 }}>No whale activity above ${minUsd} — check HELIUS_API_KEY</div>
        ) : (
          whales.map((t, i) => (
            <div key={t.mint ?? i} style={{ display: "flex", gap: 12, padding: "10px 16px", borderBottom: "1px solid var(--border)", alignItems: "center" }}
              onMouseEnter={(e) => (e.currentTarget.style.background = "var(--surface-raised)")}
              onMouseLeave={(e) => (e.currentTarget.style.background = "transparent")}
            >
              <span style={{ color: "var(--text-muted)", fontFamily: "'JetBrains Mono', monospace", fontSize: 12, width: 24 }}>{i + 1}</span>
              {t.image && <img src={t.image} alt="" style={{ width: 26, height: 26 }} onError={(e) => { e.target.style.display = "none"; }} />}
              <div style={{ flex: 1 }}>
                {t.mint ? (
                  <Link href={`/token/${t.mint}`}>
                    <div style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: 13, fontWeight: 600, cursor: "pointer" }}>{t.symbol ?? t.mint?.slice(0, 8) + "…"}</div>
                  </Link>
                ) : (
                  <div style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: 11, color: "var(--text-muted)" }}>{t.wallet?.slice(0, 12) + "…"}</div>
                )}
                {t.name && <div style={{ fontSize: 10, color: "var(--text-muted)" }}>{t.name}</div>}
              </div>
              <span style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: 12, color: "var(--accent)", fontWeight: 600 }}>
                {fmt(t.organicBuyVolume ?? t.valueUsd ?? 0)}
              </span>
              {t.netBuyers !== undefined && (
                <span style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: 11, color: "var(--text-muted)" }}>
                  {t.netBuyers} net buyers
                </span>
              )}
              <span style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: 12, color: (t.priceChange24h ?? 0) >= 0 ? "var(--accent)" : "var(--red)" }}>
                {(t.priceChange24h ?? 0) >= 0 ? "+" : ""}{(t.priceChange24h ?? 0).toFixed(1)}%
              </span>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
