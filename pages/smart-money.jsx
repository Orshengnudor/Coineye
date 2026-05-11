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

export default function SmartMoney() {
  const { data, isLoading } = useQuery({
    queryKey: ["smart-money"],
    queryFn: async () => {
      const r = await fetch("/api/analytics/smart-money");
      const j = await r.json();
      return Array.isArray(j?.data) ? j.data : [];
    },
  });
  const tokens = data ?? [];

  return (
    <div style={{ padding: "24px 28px", maxWidth: 1200 }}>
      <div style={{ marginBottom: 20 }}>
        <h1 style={{ fontFamily: "'Syne', sans-serif", fontSize: 22, fontWeight: 800, margin: 0 }}>
          ◆ Smart <span style={{ color: "var(--accent)" }}>Money</span>
        </h1>
        <div style={{ color: "var(--text-muted)", fontSize: 12, fontFamily: "'JetBrains Mono', monospace", marginTop: 4 }}>Tokens with highest smart CT likes vs total — whale-approved plays</div>
      </div>
      <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 1, marginBottom: 20, border: "1px solid var(--border)" }}>
        <StatCard label="Smart Tokens" value={tokens.length} accent />
        <StatCard label="Avg Smart Ratio" value={tokens.length ? `${(tokens.reduce((a, t) => a + (t.smartRatio ?? 0), 0) / tokens.length).toFixed(1)}%` : "—"} />
        <StatCard label="Total Smart Likes" value={tokens.reduce((a, t) => a + (t.smartCtLikes ?? 0), 0)} />
      </div>
      <div style={{ background: "var(--surface)", border: "1px solid var(--border)" }}>
        <div style={{ display: "grid", gridTemplateColumns: "36px 1fr 90px 90px 80px 80px 90px 90px", padding: "8px 12px", borderBottom: "1px solid var(--border)" }}>
          {["#", "Token", "Price", "Δ24h", "CT Likes", "Smart", "Ratio", "Volume"].map((h) => (
            <div key={h} style={{ fontSize: 10, fontFamily: "'JetBrains Mono', monospace", color: "var(--text-muted)", textTransform: "uppercase", letterSpacing: "0.08em" }}>{h}</div>
          ))}
        </div>
        {isLoading ? (
          <div style={{ padding: 24, textAlign: "center", color: "var(--text-muted)", fontFamily: "'JetBrains Mono', monospace", fontSize: 12 }}>Loading...</div>
        ) : tokens.length === 0 ? (
          <div style={{ padding: 40, textAlign: "center", color: "var(--text-muted)", fontFamily: "'JetBrains Mono', monospace", fontSize: 13 }}>No smart money data</div>
        ) : (
          tokens.map((t, i) => (
            <div key={t.mint ?? i} style={{ display: "grid", gridTemplateColumns: "36px 1fr 90px 90px 80px 80px 90px 90px", padding: "10px 12px", borderBottom: "1px solid var(--border)", alignItems: "center" }}
              onMouseEnter={(e) => (e.currentTarget.style.background = "var(--surface-raised)")}
              onMouseLeave={(e) => (e.currentTarget.style.background = "transparent")}
            >
              <span style={{ color: "var(--text-muted)", fontFamily: "'JetBrains Mono', monospace", fontSize: 12 }}>{i + 1}</span>
              <Link href={`/token/${t.mint}`}>
                <div style={{ display: "flex", alignItems: "center", gap: 8, cursor: "pointer" }}>
                  {t.image && <img src={t.image} alt="" style={{ width: 26, height: 26 }} onError={(e) => { e.target.style.display = "none"; }} />}
                  <div>
                    <div style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: 13, fontWeight: 600 }}>{t.symbol}</div>
                    <div style={{ fontSize: 10, color: "var(--text-muted)" }}>{t.name?.slice(0, 16)}</div>
                  </div>
                </div>
              </Link>
              <span style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: 12 }}>${t.price < 0.0001 ? t.price?.toExponential(2) : t.price?.toFixed(4) ?? "—"}</span>
              <span style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: 12, color: (t.priceChange24h ?? 0) >= 0 ? "var(--accent)" : "var(--red)" }}>{(t.priceChange24h ?? 0) >= 0 ? "+" : ""}{(t.priceChange24h ?? 0).toFixed(1)}%</span>
              <span style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: 12, color: "var(--text-muted)" }}>{t.ctLikes ?? 0}</span>
              <span style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: 12, color: "var(--accent)" }}>{t.smartCtLikes ?? 0}</span>
              <span style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: 12, color: (t.smartRatio ?? 0) > 50 ? "var(--accent)" : "var(--text-muted)" }}>{t.smartRatio ?? 0}%</span>
              <span style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: 12, color: "var(--text-muted)" }}>{fmt(t.volume24h)}</span>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
