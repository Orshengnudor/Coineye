import React, { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import Link from "next/link";
import { StatCard } from "../src/components/StatCard";

export default function SocialBuzz() {
  const [sortBy, setSortBy] = useState("mentions");
  const { data, isLoading } = useQuery({
    queryKey: ["social-buzz", sortBy],
    queryFn: async () => {
      const r = await fetch(`/api/social/buzz?sortBy=${sortBy}`);
      const j = await r.json();
      return Array.isArray(j?.data) ? j.data : [];
    },
  });
  const tokens = data ?? [];
  const trending = tokens.filter((t) => t.trending).length;
  const avgSentiment = tokens.length ? Math.round(tokens.reduce((a, t) => a + (t.sentiment ?? 50), 0) / tokens.length) : 0;

  return (
    <div style={{ padding: "24px 28px", maxWidth: 1200 }}>
      <div style={{ marginBottom: 20 }}>
        <h1 style={{ fontFamily: "'Syne', sans-serif", fontSize: 22, fontWeight: 800, margin: 0 }}>
          ◉ Social <span style={{ color: "var(--accent)" }}>Buzz</span>
        </h1>
        <div style={{ color: "var(--text-muted)", fontSize: 12, fontFamily: "'JetBrains Mono', monospace", marginTop: 4 }}>X / Twitter mention surge tracker</div>
      </div>
      <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 1, marginBottom: 20, border: "1px solid var(--border)" }}>
        <StatCard label="Total Tokens" value={tokens.length} accent />
        <StatCard label="Trending" value={trending} />
        <StatCard label="Avg Sentiment" value={`${avgSentiment}%`} />
      </div>
      <div className="filter-group" style={{ marginBottom: 16 }}>
        {["mentions", "sentiment", "velocity"].map((s) => (
          <button key={s} onClick={() => setSortBy(s)} className={`filter-pill${sortBy === s ? " active" : ""}`}>{s}</button>
        ))}
      </div>
      <div style={{ background: "var(--surface)", border: "1px solid var(--border)" }}>
        <div style={{ display: "grid", gridTemplateColumns: "40px 1fr 100px 100px 120px", padding: "8px 12px", borderBottom: "1px solid var(--border)" }}>
          {["#", "Token", "Mentions", "Δ24h", "Sentiment"].map((h) => (
            <div key={h} style={{ fontSize: 10, fontFamily: "'JetBrains Mono', monospace", color: "var(--text-muted)", textTransform: "uppercase", letterSpacing: "0.08em" }}>{h}</div>
          ))}
        </div>
        {isLoading ? (
          <div style={{ padding: 24, textAlign: "center", color: "var(--text-muted)", fontFamily: "'JetBrains Mono', monospace", fontSize: 12 }}>Loading...</div>
        ) : tokens.length === 0 ? (
          <div style={{ padding: 40, textAlign: "center", color: "var(--text-muted)", fontFamily: "'JetBrains Mono', monospace", fontSize: 13 }}>No social data available</div>
        ) : (
          tokens.map((t, i) => (
            <div key={t.mint ?? t.symbol ?? i} style={{ display: "grid", gridTemplateColumns: "40px 1fr 100px 100px 120px", padding: "10px 12px", borderBottom: "1px solid var(--border)", alignItems: "center" }}
              onMouseEnter={(e) => (e.currentTarget.style.background = "var(--surface-raised)")}
              onMouseLeave={(e) => (e.currentTarget.style.background = "transparent")}
            >
              <span style={{ color: "var(--text-muted)", fontFamily: "'JetBrains Mono', monospace", fontSize: 12 }}>{i + 1}</span>
              <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                <div style={{ width: 24, height: 24, background: "var(--surface-raised)", border: "1px solid var(--border)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 10, fontFamily: "'JetBrains Mono', monospace", color: "var(--accent)" }}>
                  {t.symbol?.slice(0, 2)}
                </div>
                <div>
                  <div style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: 13, fontWeight: 600, display: "flex", gap: 6, alignItems: "center" }}>
                    {t.mint ? <Link href={`/token/${t.mint}`}><span style={{ cursor: "pointer" }}>{t.symbol}</span></Link> : t.symbol}
                    {t.trending && <span style={{ fontSize: 8, background: "var(--accent-dim)", border: "1px solid var(--accent)", color: "var(--accent)", padding: "1px 4px" }}>HOT</span>}
                  </div>
                  <div style={{ fontSize: 11, color: "var(--text-muted)" }}>{t.name}</div>
                </div>
              </div>
              <span style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: 12, color: "var(--text-muted)" }}>{(t.mentions ?? 0).toLocaleString()}</span>
              <span style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: 12, color: (t.mentionChange ?? 0) >= 0 ? "var(--accent)" : "var(--red)" }}>
                {(t.mentionChange ?? 0) >= 0 ? "+" : ""}{(t.mentionChange ?? 0).toFixed(1)}%
              </span>
              <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
                <div style={{ width: 60, height: 4, background: "var(--border)" }}>
                  <div style={{ height: "100%", width: `${t.sentiment ?? 50}%`, background: (t.sentiment ?? 50) >= 65 ? "var(--accent)" : (t.sentiment ?? 50) >= 40 ? "var(--yellow)" : "var(--red)" }} />
                </div>
                <span style={{ fontSize: 10, fontFamily: "'JetBrains Mono', monospace", color: "var(--text-muted)" }}>{t.sentiment ?? 50}%</span>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
