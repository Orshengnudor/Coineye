import React from "react";
import { useQuery } from "@tanstack/react-query";
import { StatCard } from "../src/components/StatCard";
import { TokenTable } from "../src/components/TokenRow";
import { PriceChart } from "../src/components/PriceChart";
import Link from "next/link";

const QUICK_LINKS = [
  { href: "/leaderboard", label: "Leaderboard", desc: "Top performers ranked", icon: "◉" },
  { href: "/new-launches", label: "New Launches", desc: "Fresh tokens < 24h", icon: "◎" },
  { href: "/fastest-growing", label: "Fastest Growing", desc: "Velocity leaders", icon: "▲" },
  { href: "/ruggers", label: "Rugger Radar", desc: "High-risk flags", icon: "⚠" },
  { href: "/whales", label: "Whale Watch", desc: "Large wallet moves", icon: "◆" },
  { href: "/community", label: "CT Buzz", desc: "X mention surge", icon: "◉" },
];

function mockSolChart() {
  const base = 180;
  return Array.from({ length: 24 }, (_, i) => ({
    time: `${i}:00`,
    value: +(base + (Math.random() - 0.45) * 20 + i * 0.3).toFixed(2),
  }));
}

export default function Dashboard() {
  const { data: trending, isLoading } = useQuery({
    queryKey: ["dashboard-trending"],
    queryFn: async () => {
      const r = await fetch("/api/tokens/trending");
      return r.json();
    },
  });

  const { data: stats } = useQuery({
    queryKey: ["analytics-stats"],
    queryFn: async () => {
      const r = await fetch("/api/analytics/stats");
      return r.json();
    },
    staleTime: 60_000,
  });

  const solChart = React.useMemo(() => mockSolChart(), []);
  const tokens = Array.isArray(trending?.tokens) ? trending.tokens : Array.isArray(trending?.data) ? trending.data : [];
  const s = stats ?? {};

  return (
    <div style={{ padding: "24px 28px", maxWidth: 1200 }}>
      <div style={{ marginBottom: 24 }}>
        <h1 style={{ fontFamily: "'Syne', sans-serif", fontSize: 24, fontWeight: 800, margin: 0, color: "var(--text)" }}>
          CoinEye <span style={{ color: "var(--accent)" }}>Dashboard</span>
        </h1>
        <div style={{ color: "var(--text-muted)", fontSize: 12, fontFamily: "'JetBrains Mono', monospace", marginTop: 4 }}>
          Solana token intelligence — live market data
        </div>
      </div>

      <div className="stat-grid" style={{ marginBottom: 24 }}>
        <StatCard label="Tokens Tracked" value={s.totalTokens ?? "—"} sub="on Bags.fm" />
        <StatCard label="24h Volume" value={s.totalVolume24h ? `$${(s.totalVolume24h / 1e6).toFixed(1)}M` : "—"} sub="across DEXs" />
        <StatCard label="Rising" value={s.rising ?? "—"} accent />
        <StatCard label="Falling" value={s.falling ?? "—"} />
        <StatCard label="Graduated" value={s.graduatedCount ?? "—"} sub="tokens" />
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "1fr 280px", gap: 16, marginBottom: 24 }}>
        <div className="card" style={{ padding: 16 }}>
          <div className="section-label" style={{ marginBottom: 12 }}>SOL / USD — 24h (simulated)</div>
          <PriceChart data={solChart} height={160} type="area" />
        </div>
        <div className="card" style={{ padding: 16 }}>
          <div className="section-label" style={{ marginBottom: 12 }}>Quick Navigation</div>
          <div style={{ display: "flex", flexDirection: "column" }}>
            {QUICK_LINKS.map((l) => (
              <Link key={l.href} href={l.href}>
                <div className="quick-link-row">
                  <span style={{ color: "var(--accent)", fontSize: 12 }}>{l.icon}</span>
                  <div>
                    <div style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: 12, fontWeight: 600 }}>{l.label}</div>
                    <div style={{ fontSize: 10, color: "var(--text-muted)" }}>{l.desc}</div>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        </div>
      </div>

      <div className="cta-banner" style={{ marginBottom: 20 }}>
        <div>
          <div style={{ fontFamily: "'Syne', sans-serif", fontWeight: 700, fontSize: 14, color: "var(--accent)" }}>Launch Your Token on Bags.fm</div>
          <div style={{ fontSize: 12, color: "var(--text-muted)", marginTop: 2 }}>Create, launch & earn fees from your Solana token in minutes. Tracked by CoinEye instantly.</div>
        </div>
        <a href="https://bags.fm" target="_blank" rel="noopener noreferrer" className="btn btn-primary btn-sm" style={{ whiteSpace: "nowrap", flexShrink: 0, textDecoration: "none" }}>
          Launch Now →
        </a>
      </div>

      <div className="card">
        <div className="card-header">
          <span style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: 13, fontWeight: 600 }}>◈ Trending Now</span>
          <Link href="/trending"><span className="link-accent">View all →</span></Link>
        </div>
        <TokenTable
          tokens={tokens.slice(0, 10).map((t, i) => ({
            rank: i + 1, mint: t.mint, symbol: t.symbol ?? "???", name: t.name ?? t.symbol,
            price: t.price, priceChange24h: t.priceChange24h, volume24h: t.volume24h,
            marketCap: t.marketCap, image: t.image,
          }))}
          columns={["rank", "name", "price", "change", "volume", "mcap"]}
          loading={isLoading}
          emptyMsg="No trending tokens — API key may be missing"
        />
      </div>
    </div>
  );
}
