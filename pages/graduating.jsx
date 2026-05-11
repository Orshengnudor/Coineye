import React from "react";
import { useQuery } from "@tanstack/react-query";
import Link from "next/link";
import { StatCard } from "../src/components/StatCard";

function fmt(n) {
  if (!n) return "—";
  if (n >= 1e6) return `$${(n / 1e6).toFixed(1)}M`;
  if (n >= 1e3) return `$${(n / 1e3).toFixed(0)}K`;
  return `$${n.toFixed(2)}`;
}

export default function Graduating() {
  const { data, isLoading } = useQuery({
    queryKey: ["graduating"],
    queryFn: async () => {
      const r = await fetch("/api/analytics/graduation");
      return r.json();
    },
  });

  const nearGrad = data?.nearGraduation ?? [];
  const graduated = data?.graduated ?? [];
  const stats = data?.stats ?? {};

  return (
    <div style={{ padding: "24px 28px", maxWidth: 1200 }}>
      <div style={{ marginBottom: 20 }}>
        <h1 style={{ fontFamily: "'Syne', sans-serif", fontSize: 22, fontWeight: 800, margin: 0 }}>
          ⬆ <span style={{ color: "var(--accent)" }}>Graduating</span>
        </h1>
        <div style={{ color: "var(--text-muted)", fontSize: 12, fontFamily: "'JetBrains Mono', monospace", marginTop: 4 }}>Bonding curve graduation tracker — Bags.fm tokens near 100%</div>
      </div>
      <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 1, marginBottom: 20, border: "1px solid var(--border)" }}>
        <StatCard label="Near Graduation" value={stats.nearGradCount ?? nearGrad.length} sub="≥ 80%" />
        <StatCard label="Graduated" value={stats.graduated ?? graduated.length} accent />
        <StatCard label="Total Tracked" value={stats.total ?? 0} />
      </div>

      <div style={{ marginBottom: 24 }}>
        <div style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: 11, color: "var(--text-faint)", textTransform: "uppercase", letterSpacing: "0.08em", marginBottom: 12 }}>Near Graduation (70-99%)</div>
        <div style={{ background: "var(--surface)", border: "1px solid var(--border)" }}>
          {isLoading ? (
            <div style={{ padding: 24, textAlign: "center", color: "var(--text-muted)", fontFamily: "'JetBrains Mono', monospace", fontSize: 12 }}>Loading...</div>
          ) : nearGrad.length === 0 ? (
            <div style={{ padding: 24, textAlign: "center", color: "var(--text-muted)", fontFamily: "'JetBrains Mono', monospace", fontSize: 12 }}>No tokens near graduation</div>
          ) : (
            nearGrad.map((t, i) => (
              <Link key={t.mint} href={`/token/${t.mint}`}>
                <div style={{ display: "flex", alignItems: "center", gap: 12, padding: "10px 16px", borderBottom: "1px solid var(--border)", cursor: "pointer" }}
                  onMouseEnter={(e) => (e.currentTarget.style.background = "var(--surface-raised)")}
                  onMouseLeave={(e) => (e.currentTarget.style.background = "transparent")}
                >
                  <span style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: 11, color: "var(--text-faint)", width: 24 }}>{i + 1}</span>
                  {t.image && <img src={t.image} alt="" style={{ width: 26, height: 26 }} onError={(e) => { e.target.style.display = "none"; }} />}
                  <div style={{ flex: 1 }}>
                    <div style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: 13, fontWeight: 600 }}>{t.symbol}</div>
                    <div style={{ fontSize: 10, color: "var(--text-muted)" }}>{t.name}</div>
                  </div>
                  <div style={{ width: 120 }}>
                    <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
                      <div style={{ flex: 1, height: 6, background: "var(--border)" }}>
                        <div style={{ height: "100%", width: `${t.bondingCurve ?? 0}%`, background: (t.bondingCurve ?? 0) >= 90 ? "var(--accent)" : "var(--yellow)" }} />
                      </div>
                      <span style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: 11, color: "var(--accent)", minWidth: 36 }}>{t.bondingCurve?.toFixed(1)}%</span>
                    </div>
                  </div>
                  <span style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: 12, color: "var(--text-muted)", minWidth: 60, textAlign: "right" }}>{fmt(t.marketCap)}</span>
                  <span style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: 12, color: (t.priceChange24h ?? 0) >= 0 ? "var(--accent)" : "var(--red)", minWidth: 60, textAlign: "right" }}>
                    {(t.priceChange24h ?? 0) >= 0 ? "+" : ""}{(t.priceChange24h ?? 0).toFixed(1)}%
                  </span>
                </div>
              </Link>
            ))
          )}
        </div>
      </div>
    </div>
  );
}
