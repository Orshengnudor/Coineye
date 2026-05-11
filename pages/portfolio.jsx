import React, { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { useAppContext } from "../src/components/provider";
import { StatCard } from "../src/components/StatCard";

function fmt(n) {
  if (!n) return "—";
  if (n >= 1e6) return `$${(n / 1e6).toFixed(2)}M`;
  if (n >= 1e3) return `$${(n / 1e3).toFixed(0)}K`;
  return `$${n.toFixed(2)}`;
}

export default function Portfolio() {
  const { wallet } = useAppContext();
  const [manualWallet, setManualWallet] = useState("");
  const activeWallet = wallet || manualWallet;

  const { data, isLoading, refetch } = useQuery({
    queryKey: ["portfolio", activeWallet],
    enabled: !!activeWallet,
    queryFn: async () => {
      const r = await fetch(`/api/portfolio/${activeWallet}`);
      return r.json();
    },
  });

  return (
    <div style={{ padding: "24px 28px", maxWidth: 1000 }}>
      <div style={{ marginBottom: 20 }}>
        <h1 style={{ fontFamily: "'Syne', sans-serif", fontSize: 22, fontWeight: 800, margin: 0 }}>
          ◈ My <span style={{ color: "var(--accent)" }}>Portfolio</span>
        </h1>
        <div style={{ color: "var(--text-muted)", fontSize: 12, fontFamily: "'JetBrains Mono', monospace", marginTop: 4 }}>View any wallet's token holdings</div>
      </div>

      {!wallet && (
        <div style={{ marginBottom: 20, display: "flex", gap: 8 }}>
          <input
            className="search-input"
            style={{ maxWidth: 400 }}
            placeholder="Enter Solana wallet address..."
            value={manualWallet}
            onChange={(e) => setManualWallet(e.target.value)}
          />
          <button className="btn btn-primary btn-sm" onClick={() => refetch()}>Load</button>
        </div>
      )}

      {!activeWallet && (
        <div style={{ padding: 40, textAlign: "center", color: "var(--text-muted)", fontFamily: "'JetBrains Mono', monospace", fontSize: 13, border: "1px solid var(--border)" }}>
          Connect wallet or enter a wallet address to view portfolio
        </div>
      )}

      {activeWallet && (
        <>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 1, marginBottom: 20, border: "1px solid var(--border)" }}>
            <StatCard label="Total Value" value={data?.totalValueUsd ? fmt(data.totalValueUsd) : "—"} accent />
            <StatCard label="Tokens" value={data?.tokenCount ?? "—"} />
            <StatCard label="SOL Price" value={data?.solPrice ? `$${data.solPrice.toFixed(2)}` : "—"} />
          </div>
          {isLoading ? (
            <div style={{ padding: 24, textAlign: "center", color: "var(--text-muted)", fontFamily: "'JetBrains Mono', monospace", fontSize: 12 }}>Loading portfolio...</div>
          ) : (data?.tokens ?? []).length === 0 ? (
            <div style={{ padding: 40, textAlign: "center", color: "var(--text-muted)", fontFamily: "'JetBrains Mono', monospace", fontSize: 13, border: "1px solid var(--border)" }}>
              No tokens found — check HELIUS_API_KEY or wallet may be empty
            </div>
          ) : (
            <div style={{ background: "var(--surface)", border: "1px solid var(--border)" }}>
              <div style={{ display: "grid", gridTemplateColumns: "1fr 100px 100px 100px", padding: "8px 12px", borderBottom: "1px solid var(--border)" }}>
                {["Token", "Amount", "Price", "Value USD"].map((h) => (
                  <div key={h} style={{ fontSize: 10, fontFamily: "'JetBrains Mono', monospace", color: "var(--text-muted)", textTransform: "uppercase", letterSpacing: "0.08em" }}>{h}</div>
                ))}
              </div>
              {(data?.tokens ?? []).map((t, i) => (
                <div key={t.mint ?? i} style={{ display: "grid", gridTemplateColumns: "1fr 100px 100px 100px", padding: "10px 12px", borderBottom: "1px solid var(--border)", alignItems: "center" }}>
                  <div style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: 13, fontWeight: 600 }}>{t.symbol}</div>
                  <div style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: 12, color: "var(--text-muted)" }}>{t.amount?.toFixed(2)}</div>
                  <div style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: 12, color: "var(--text-muted)" }}>${t.price?.toFixed(4)}</div>
                  <div style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: 12, color: "var(--accent)", fontWeight: 600 }}>{fmt(t.valueUsd)}</div>
                </div>
              ))}
            </div>
          )}
        </>
      )}
    </div>
  );
}
