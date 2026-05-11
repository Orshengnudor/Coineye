import React, { useState } from "react";
import { useQuery } from "@tanstack/react-query";

function fmt(n, prefix = "$") {
  if (!n) return "—";
  if (n >= 1e9) return `${prefix}${(n / 1e9).toFixed(2)}B`;
  if (n >= 1e6) return `${prefix}${(n / 1e6).toFixed(2)}M`;
  if (n >= 1e3) return `${prefix}${(n / 1e3).toFixed(0)}K`;
  return `${prefix}${n.toFixed(4)}`;
}

function MetricRow({ label, a, b, higher = "good" }) {
  const aNum = parseFloat(a) || 0;
  const bNum = parseFloat(b) || 0;
  const aWins = higher === "good" ? aNum >= bNum : aNum <= bNum;

  return (
    <div style={{ display: "grid", gridTemplateColumns: "1fr 140px 140px", padding: "8px 12px", borderBottom: "1px solid var(--border)", alignItems: "center" }}>
      <span style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: 11, color: "var(--text-faint)", textTransform: "uppercase", letterSpacing: "0.06em" }}>{label}</span>
      <span style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: 13, color: aWins && a !== "—" ? "var(--accent)" : "var(--text)", textAlign: "center" }}>{a}</span>
      <span style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: 13, color: !aWins && b !== "—" ? "var(--accent)" : "var(--text)", textAlign: "center" }}>{b}</span>
    </div>
  );
}

export default function CompareTokens() {
  const [mintA, setMintA] = useState("");
  const [mintB, setMintB] = useState("");
  const [compareA, setCompareA] = useState("");
  const [compareB, setCompareB] = useState("");

  const handleCompare = () => { setCompareA(mintA.trim()); setCompareB(mintB.trim()); };

  const { data: tokenA, isLoading: loadA } = useQuery({
    queryKey: ["compare-a", compareA],
    enabled: !!compareA,
    queryFn: async () => { const r = await fetch(`/api/tokens/${compareA}`); return r.json(); },
  });
  const { data: tokenB, isLoading: loadB } = useQuery({
    queryKey: ["compare-b", compareB],
    enabled: !!compareB,
    queryFn: async () => { const r = await fetch(`/api/tokens/${compareB}`); return r.json(); },
  });

  return (
    <div style={{ padding: "24px 28px", maxWidth: 900 }}>
      <div style={{ marginBottom: 20 }}>
        <h1 style={{ fontFamily: "'Syne', sans-serif", fontSize: 22, fontWeight: 800, margin: 0 }}>
          ⇄ Compare <span style={{ color: "var(--accent)" }}>Tokens</span>
        </h1>
        <div style={{ color: "var(--text-muted)", fontSize: 12, fontFamily: "'JetBrains Mono', monospace", marginTop: 4 }}>Side-by-side comparison of any two tokens</div>
      </div>
      <div style={{ display: "flex", gap: 8, marginBottom: 20, flexWrap: "wrap" }}>
        <input className="search-input" style={{ maxWidth: 300 }} placeholder="Token A mint address..." value={mintA} onChange={(e) => setMintA(e.target.value)} />
        <input className="search-input" style={{ maxWidth: 300 }} placeholder="Token B mint address..." value={mintB} onChange={(e) => setMintB(e.target.value)} />
        <button className="btn btn-primary btn-sm" onClick={handleCompare}>Compare →</button>
      </div>

      {(compareA || compareB) && (
        <div style={{ background: "var(--surface)", border: "1px solid var(--border)" }}>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 140px 140px", padding: "10px 12px", borderBottom: "1px solid var(--border)", background: "var(--surface-raised)" }}>
            <span style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: 10, color: "var(--text-faint)", textTransform: "uppercase" }}>Metric</span>
            <div style={{ textAlign: "center" }}>
              {loadA ? (
                <div style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: 12, color: "var(--text-muted)" }}>Loading...</div>
              ) : tokenA?.symbol ? (
                <div>
                  <div style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: 14, fontWeight: 700, color: "var(--accent)" }}>${tokenA.symbol}</div>
                  <div style={{ fontSize: 10, color: "var(--text-muted)" }}>{tokenA.name}</div>
                </div>
              ) : <span style={{ color: "var(--text-muted)", fontSize: 12 }}>—</span>}
            </div>
            <div style={{ textAlign: "center" }}>
              {loadB ? (
                <div style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: 12, color: "var(--text-muted)" }}>Loading...</div>
              ) : tokenB?.symbol ? (
                <div>
                  <div style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: 14, fontWeight: 700, color: "var(--blue)" }}>${tokenB.symbol}</div>
                  <div style={{ fontSize: 10, color: "var(--text-muted)" }}>{tokenB.name}</div>
                </div>
              ) : <span style={{ color: "var(--text-muted)", fontSize: 12 }}>—</span>}
            </div>
          </div>
          <MetricRow label="Price" a={tokenA ? fmt(tokenA.price) : "—"} b={tokenB ? fmt(tokenB.price) : "—"} higher="neutral" />
          <MetricRow label="24h Change" a={tokenA ? `${(tokenA.priceChange?.h24 ?? 0).toFixed(2)}%` : "—"} b={tokenB ? `${(tokenB.priceChange?.h24 ?? 0).toFixed(2)}%` : "—"} higher="good" />
          <MetricRow label="Market Cap" a={tokenA ? fmt(tokenA.marketCap) : "—"} b={tokenB ? fmt(tokenB.marketCap) : "—"} higher="good" />
          <MetricRow label="Volume 24h" a={tokenA ? fmt(tokenA.volume?.h24) : "—"} b={tokenB ? fmt(tokenB.volume?.h24) : "—"} higher="good" />
          <MetricRow label="Liquidity" a={tokenA ? fmt(tokenA.liquidity) : "—"} b={tokenB ? fmt(tokenB.liquidity) : "—"} higher="good" />
          <MetricRow label="Holders" a={tokenA ? String(tokenA.holderCount ?? 0) : "—"} b={tokenB ? String(tokenB.holderCount ?? 0) : "—"} higher="good" />
          <MetricRow label="Organic Score" a={tokenA ? String(tokenA.organicScore ?? 0) : "—"} b={tokenB ? String(tokenB.organicScore ?? 0) : "—"} higher="good" />
          <MetricRow label="Lifetime Fees" a={tokenA?.lifetimeFees ? `${tokenA.lifetimeFees.sol?.toFixed(3)} SOL` : "—"} b={tokenB?.lifetimeFees ? `${tokenB.lifetimeFees.sol?.toFixed(3)} SOL` : "—"} higher="good" />
        </div>
      )}
    </div>
  );
}
