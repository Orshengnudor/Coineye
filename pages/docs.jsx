import React from "react";
import Link from "next/link";

const SECTIONS = [
  {
    title: "Overview",
    content: "CoinEye is a real-time Solana token intelligence platform powered by Bags.fm. It aggregates token data, social signals, and on-chain analytics to help traders find alpha.",
  },
  {
    title: "Data Sources",
    items: [
      "Bags.fm API — token launches, lifetime fees, organic scores, bonding curves",
      "Helius RPC — wallet balances, transaction history, holder data",
      "Jupiter Price API — free real-time token prices",
      "DexScreener — additional token pair data",
    ],
  },
  {
    title: "API Endpoints",
    items: [
      "GET /api/tokens/feed — newest Bags.fm launches",
      "GET /api/tokens/leaderboard — top tokens by various metrics",
      "GET /api/tokens/trending — highest organic + volume combo",
      "GET /api/tokens/:mint — full token detail",
      "GET /api/analytics/stats — global stats",
      "GET /api/analytics/rug-radar — high risk tokens",
      "GET /api/analytics/dev-leaderboard — top earning developers",
      "GET /api/social/buzz — social mention data",
      "GET /api/portfolio/:wallet — wallet holdings",
    ],
  },
  {
    title: "Environment Variables",
    items: [
      "BAGS_API_KEY — required for all token data",
      "HELIUS_API_KEY — required for wallet data and transactions",
      "NEXT_PUBLIC_PRIVY_APP_ID — for social login",
    ],
  },
];

export default function Docs() {
  return (
    <div style={{ padding: "24px 28px", maxWidth: 800 }}>
      <div style={{ marginBottom: 24 }}>
        <h1 style={{ fontFamily: "'Syne', sans-serif", fontSize: 22, fontWeight: 800, margin: 0 }}>
          ? <span style={{ color: "var(--accent)" }}>Documentation</span>
        </h1>
        <div style={{ color: "var(--text-muted)", fontSize: 12, fontFamily: "'JetBrains Mono', monospace", marginTop: 4 }}>CoinEye platform reference</div>
      </div>
      {SECTIONS.map((s) => (
        <div key={s.title} style={{ marginBottom: 28 }}>
          <div style={{ fontFamily: "'Syne', sans-serif", fontSize: 16, fontWeight: 700, color: "var(--text)", marginBottom: 10, borderLeft: "2px solid var(--accent)", paddingLeft: 12 }}>
            {s.title}
          </div>
          {s.content && (
            <p style={{ fontFamily: "'Inter', sans-serif", fontSize: 14, color: "var(--text-muted)", lineHeight: 1.6, margin: 0 }}>{s.content}</p>
          )}
          {s.items && (
            <ul style={{ margin: 0, padding: "0 0 0 16px" }}>
              {s.items.map((item) => (
                <li key={item} style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: 12, color: "var(--text-muted)", marginBottom: 4, lineHeight: 1.5 }}>{item}</li>
              ))}
            </ul>
          )}
        </div>
      ))}
      <div style={{ marginTop: 32, padding: "16px 20px", background: "var(--surface)", border: "1px solid var(--border)" }}>
        <div style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: 11, color: "var(--text-faint)", textTransform: "uppercase", letterSpacing: "0.08em", marginBottom: 8 }}>External Links</div>
        <div style={{ display: "flex", gap: 12, flexWrap: "wrap" }}>
          {[
            { href: "https://bags.fm", label: "Bags.fm" },
            { href: "https://helius.dev", label: "Helius Docs" },
            { href: "https://www.jup.ag", label: "Jupiter" },
            { href: "https://dexscreener.com", label: "DexScreener" },
          ].map(({ href, label }) => (
            <a key={label} href={href} target="_blank" rel="noopener noreferrer" className="ext-link" style={{ fontSize: 12 }}>{label} ↗</a>
          ))}
        </div>
      </div>
    </div>
  );
}
