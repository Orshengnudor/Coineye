import React from "react";
import { useQuery } from "@tanstack/react-query";

function fmt(n) {
  if (!n) return "—";
  if (n >= 1e6) return `$${(n / 1e6).toFixed(2)}M`;
  if (n >= 1e3) return `$${(n / 1e3).toFixed(0)}K`;
  return `$${n.toFixed(0)}`;
}

export default function CopyTradeFeed() {
  const { data, isLoading } = useQuery({
    queryKey: ["copy-trade"],
    queryFn: async () => {
      const r = await fetch("/api/analytics/copy-trade");
      return r.json();
    },
    refetchInterval: 30000,
  });

  const topWallets = data?.topWallets ?? [];
  const recentTrades = data?.recentTrades ?? [];

  return (
    <div style={{ padding: "24px 28px", maxWidth: 1200 }}>
      <div style={{ marginBottom: 20 }}>
        <h1 style={{ fontFamily: "'Syne', sans-serif", fontSize: 22, fontWeight: 800, margin: 0 }}>
          ⟳ Copy-Trade <span style={{ color: "var(--accent)" }}>Feed</span>
        </h1>
        <div style={{ color: "var(--text-muted)", fontSize: 12, fontFamily: "'JetBrains Mono', monospace", marginTop: 4 }}>Smart wallet leaderboard + recent trades</div>
      </div>
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16 }}>
        <div className="card">
          <div className="card-header">Smart Wallet Leaderboard</div>
          {isLoading ? (
            <div style={{ padding: 16, color: "var(--text-muted)", fontFamily: "'JetBrains Mono', monospace", fontSize: 12 }}>Loading...</div>
          ) : (
            topWallets.map((w, i) => (
              <div key={w.wallet ?? i} style={{ display: "flex", gap: 12, padding: "10px 0", borderBottom: "1px solid var(--border)", alignItems: "center" }}>
                <span style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: 11, color: "var(--text-faint)", width: 20 }}>{i + 1}</span>
                <div style={{ flex: 1 }}>
                  <div style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: 12, color: "var(--text)" }}>{w.wallet?.slice(0, 10)}…</div>
                  <div style={{ fontSize: 10, color: "var(--text-muted)" }}>{w.trades30d} trades / 30d</div>
                </div>
                <span style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: 12, color: "var(--accent)" }}>{w.winRate?.toFixed(0)}% win</span>
                <span style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: 12, color: "var(--text-muted)" }}>{fmt(w.pnl30d)} PnL</span>
              </div>
            ))
          )}
        </div>
        <div className="card">
          <div className="card-header">Recent Trades Feed</div>
          {isLoading ? (
            <div style={{ padding: 16, color: "var(--text-muted)", fontFamily: "'JetBrains Mono', monospace", fontSize: 12 }}>Loading...</div>
          ) : (
            recentTrades.map((t, i) => (
              <div key={i} style={{ display: "flex", gap: 10, padding: "8px 0", borderBottom: "1px solid var(--border)", alignItems: "center" }}>
                <span style={{ fontSize: 10, fontFamily: "'JetBrains Mono', monospace", padding: "2px 6px", border: `1px solid ${t.type === "buy" ? "var(--accent)" : "var(--red)"}`, color: t.type === "buy" ? "var(--accent)" : "var(--red)" }}>
                  {t.type?.toUpperCase()}
                </span>
                <div style={{ flex: 1 }}>
                  <div style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: 12, fontWeight: 600 }}>{t.symbol}</div>
                  <div style={{ fontSize: 10, color: "var(--text-muted)" }}>{t.wallet}</div>
                </div>
                <span style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: 12, color: t.type === "buy" ? "var(--accent)" : "var(--red)" }}>{fmt(t.usdValue)}</span>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
}
