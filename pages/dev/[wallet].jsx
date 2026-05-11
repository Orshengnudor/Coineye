import React from "react";
import { useRouter } from "next/router";
import { useQuery } from "@tanstack/react-query";
import Link from "next/link";
import { StatCard } from "../../src/components/StatCard";

function fmt(n) {
  if (!n) return "—";
  if (n >= 1e6) return `$${(n / 1e6).toFixed(1)}M`;
  if (n >= 1e3) return `$${(n / 1e3).toFixed(0)}K`;
  return `$${n.toFixed(2)}`;
}

function shortAddr(a) {
  if (!a) return "—";
  return `${a.slice(0, 6)}…${a.slice(-6)}`;
}

export default function DevProfile() {
  const router = useRouter();
  const wallet = router.query.wallet ?? "";

  const { data, isLoading } = useQuery({
    queryKey: ["dev-tokens", wallet],
    enabled: !!wallet,
    queryFn: async () => {
      const r = await fetch(`/api/analytics/dev-tokens?wallet=${wallet}`);
      const j = await r.json();
      return Array.isArray(j?.data) ? j.data : [];
    },
  });

  const tokens = data ?? [];
  const totalFees = tokens.reduce((a, t) => a + (t.feesSol ?? 0), 0);
  const totalVol = tokens.reduce((a, t) => a + (t.volume24h ?? 0), 0);

  return (
    <div style={{ padding: "24px 28px", maxWidth: 1100 }}>
      <div style={{ marginBottom: 16 }}>
        <Link href="/dev-leaderboard"><span className="back-link">← Dev Leaderboard</span></Link>
      </div>
      <div style={{ marginBottom: 20 }}>
        <h1 style={{ fontFamily: "'Syne', sans-serif", fontSize: 22, fontWeight: 800, margin: 0 }}>
          ◬ Dev <span style={{ color: "var(--accent)" }}>Profile</span>
        </h1>
        <div style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: 11, color: "var(--text-muted)", marginTop: 4 }}>
          {shortAddr(wallet)} · <a href={`https://solscan.io/account/${wallet}`} target="_blank" rel="noopener noreferrer" className="ext-link">Solscan ↗</a>
        </div>
      </div>
      <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: 1, marginBottom: 20, border: "1px solid var(--border)" }}>
        <StatCard label="Tokens Launched" value={tokens.length} />
        <StatCard label="Total Fees" value={`${totalFees.toFixed(3)} SOL`} accent />
        <StatCard label="Total Volume" value={fmt(totalVol)} />
        <StatCard label="Graduated" value={tokens.filter((t) => t.isGraduated).length} />
      </div>
      <div style={{ background: "var(--surface)", border: "1px solid var(--border)" }}>
        <div style={{ display: "grid", gridTemplateColumns: "1fr 90px 90px 90px 80px 80px", padding: "8px 12px", borderBottom: "1px solid var(--border)" }}>
          {["Token", "Price Δ 24h", "Volume", "MCap", "Fees SOL", "Status"].map((h) => (
            <div key={h} style={{ fontSize: 10, fontFamily: "'JetBrains Mono', monospace", color: "var(--text-muted)", textTransform: "uppercase", letterSpacing: "0.08em" }}>{h}</div>
          ))}
        </div>
        {isLoading ? (
          <div style={{ padding: 24, textAlign: "center", color: "var(--text-muted)", fontFamily: "'JetBrains Mono', monospace", fontSize: 12 }}>Loading...</div>
        ) : tokens.length === 0 ? (
          <div style={{ padding: 40, textAlign: "center", color: "var(--text-muted)", fontFamily: "'JetBrains Mono', monospace", fontSize: 13 }}>No tokens found for this wallet</div>
        ) : (
          tokens.map((t, i) => (
            <div key={t.mint ?? i} style={{ display: "grid", gridTemplateColumns: "1fr 90px 90px 90px 80px 80px", padding: "10px 12px", borderBottom: "1px solid var(--border)", alignItems: "center" }}
              onMouseEnter={(e) => (e.currentTarget.style.background = "var(--surface-raised)")}
              onMouseLeave={(e) => (e.currentTarget.style.background = "transparent")}
            >
              <Link href={`/token/${t.mint}`}>
                <div style={{ display: "flex", alignItems: "center", gap: 8, cursor: "pointer" }}>
                  {t.image && <img src={t.image} alt="" style={{ width: 24, height: 24 }} onError={(e) => { e.target.style.display = "none"; }} />}
                  <div>
                    <div style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: 13, fontWeight: 600 }}>{t.symbol}</div>
                    <div style={{ fontSize: 10, color: "var(--text-muted)" }}>{t.name?.slice(0, 16)}</div>
                  </div>
                </div>
              </Link>
              <span style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: 12, color: (t.priceChange24h ?? 0) >= 0 ? "var(--accent)" : "var(--red)" }}>
                {(t.priceChange24h ?? 0) >= 0 ? "+" : ""}{(t.priceChange24h ?? 0).toFixed(1)}%
              </span>
              <span style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: 12, color: "var(--text-muted)" }}>{fmt(t.volume24h)}</span>
              <span style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: 12, color: "var(--text-muted)" }}>{fmt(t.marketCap)}</span>
              <span style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: 12, color: "var(--accent)" }}>{(t.feesSol ?? 0).toFixed(3)}</span>
              <span style={{ fontSize: 9, fontFamily: "'JetBrains Mono', monospace", padding: "2px 5px", border: `1px solid ${t.isGraduated ? "var(--accent)" : "var(--text-faint)"}`, color: t.isGraduated ? "var(--accent)" : "var(--text-faint)" }}>
                {t.isGraduated ? "GRAD" : "PRE"}
              </span>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
