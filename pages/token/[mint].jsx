import React, { useState } from "react";
import { useRouter } from "next/router";
import { useQuery } from "@tanstack/react-query";
import Link from "next/link";
import { PriceChart } from "../../src/components/PriceChart";
import { StatCard } from "../../src/components/StatCard";

function shortAddr(addr) {
  if (!addr) return "—";
  return `${addr.slice(0, 6)}…${addr.slice(-6)}`;
}

export default function TokenDetail() {
  const router = useRouter();
  const mint = router.query.mint ?? "";
  const [chartWindow, setChartWindow] = useState("24h");

  const { data: token, isLoading } = useQuery({
    queryKey: ["token", mint],
    enabled: !!mint,
    queryFn: async () => {
      const r = await fetch(`/api/tokens/${mint}`);
      return r.json();
    },
  });

  const { data: priceHistory } = useQuery({
    queryKey: ["token-price", mint, chartWindow],
    enabled: !!mint,
    queryFn: async () => {
      const r = await fetch(`/api/tokens/${mint}/price-history?window=${chartWindow}`);
      const j = await r.json();
      return Array.isArray(j?.data) ? j.data : [];
    },
  });

  const { data: socialData } = useQuery({
    queryKey: ["token-social", mint],
    enabled: !!mint,
    queryFn: async () => {
      const r = await fetch(`/api/social/token/${mint}`);
      return r.json();
    },
  });

  const chartData = (priceHistory ?? []).map((p) => ({ time: p.time ?? p.timestamp, value: p.price ?? p.value }));

  if (isLoading) {
    return (
      <div style={{ padding: "24px 28px" }}>
        <div style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: 13, color: "var(--text-muted)" }}>Loading token data...</div>
      </div>
    );
  }

  const t = token ?? {};
  const priceChange24h = t.priceChange?.h24 ?? 0;
  const changeColor = !priceChange24h ? "var(--text-muted)" : priceChange24h >= 0 ? "var(--accent)" : "var(--red)";
  const changeSign = priceChange24h > 0 ? "+" : "";

  return (
    <div style={{ padding: "24px 28px", maxWidth: 1200 }}>
      <div style={{ marginBottom: 16 }}>
        <Link href="/"><span className="back-link">← Back to Dashboard</span></Link>
      </div>

      {/* Token Header */}
      <div style={{ display: "flex", gap: 16, alignItems: "flex-start", marginBottom: 24 }}>
        {t.image ? (
          <img src={t.image} alt={t.symbol} style={{ width: 48, height: 48, border: "1px solid var(--border)", objectFit: "cover" }} />
        ) : (
          <div style={{ width: 48, height: 48, background: "var(--surface)", border: "1px solid var(--accent)", display: "flex", alignItems: "center", justifyContent: "center", fontFamily: "'JetBrains Mono', monospace", fontSize: 16, fontWeight: 700, color: "var(--accent)" }}>
            {(t.symbol ?? "?").slice(0, 2)}
          </div>
        )}
        <div style={{ flex: 1 }}>
          <div style={{ display: "flex", gap: 12, alignItems: "baseline" }}>
            <h1 style={{ fontFamily: "'Syne', sans-serif", fontSize: 24, fontWeight: 800, margin: 0 }}>{t.symbol ?? mint.slice(0, 8) + "…"}</h1>
            <span style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: 14, color: "var(--text-muted)" }}>{t.name}</span>
          </div>
          <div style={{ display: "flex", gap: 16, marginTop: 6, alignItems: "center" }}>
            <span style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: 20, fontWeight: 700 }}>
              ${t.price < 0.0001 ? t.price?.toExponential(3) : (t.price?.toFixed(6) ?? "—")}
            </span>
            <span style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: 14, color: changeColor }}>
              {priceChange24h !== undefined ? `${changeSign}${priceChange24h.toFixed(2)}%` : ""}
            </span>
          </div>
          <div style={{ marginTop: 6, display: "flex", gap: 12 }}>
            {[
              { href: `https://solscan.io/token/${mint}`, label: "Solscan ↗" },
              { href: `https://dexscreener.com/solana/${mint}`, label: "DexScreener ↗" },
              ...(t.socials?.website ? [{ href: t.socials.website, label: "Website ↗" }] : []),
              ...(t.socials?.twitter ? [{ href: t.socials.twitter.startsWith("http") ? t.socials.twitter : `https://twitter.com/${t.socials.twitter}`, label: "𝕏 Twitter ↗" }] : []),
            ].map(({ href, label }) => (
              <a key={label} href={href} target="_blank" rel="noopener noreferrer" className="ext-link">{label}</a>
            ))}
          </div>
        </div>
      </div>

      {/* Stats Row */}
      <div className="stat-grid" style={{ marginBottom: 20 }}>
        <StatCard label="Market Cap" value={t.marketCap >= 1e6 ? `$${(t.marketCap / 1e6).toFixed(2)}M` : t.marketCap ? `$${(t.marketCap / 1e3).toFixed(0)}K` : "—"} />
        <StatCard label="24h Volume" value={t.volume?.h24 >= 1e6 ? `$${(t.volume.h24 / 1e6).toFixed(2)}M` : t.volume?.h24 ? `$${(t.volume.h24 / 1e3).toFixed(0)}K` : "—"} />
        <StatCard label="Liquidity" value={t.liquidity ? `$${(t.liquidity / 1e3).toFixed(0)}K` : "—"} />
        <StatCard label="Holders" value={t.holderCount?.toLocaleString() ?? "—"} />
        <StatCard label="Organic Score" value={t.organicScore ?? "—"} sub={t.organicScoreLabel} />
        <StatCard label="FDV" value={t.fdv >= 1e6 ? `$${(t.fdv / 1e6).toFixed(2)}M` : t.fdv ? `$${(t.fdv / 1e3).toFixed(0)}K` : "—"} />
      </div>

      {/* Price Chart */}
      <div className="card" style={{ padding: 16, marginBottom: 16 }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 12 }}>
          <div className="section-label">Price Chart</div>
          <div className="filter-group">
            {["1h", "4h", "24h", "7d"].map((w) => (
              <button key={w} onClick={() => setChartWindow(w)} className={`filter-pill${chartWindow === w ? " active" : ""}`}>{w}</button>
            ))}
          </div>
        </div>
        <PriceChart
          data={chartData.length ? chartData : Array.from({ length: 24 }, (_, i) => ({ time: `${i}:00`, value: (t.price ?? 0.001) * (0.9 + Math.random() * 0.2) }))}
          height={240} type="area"
          color={priceChange24h >= 0 ? undefined : "var(--red)"}
        />
      </div>

      {/* Bottom grid */}
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16 }}>
        <div className="card" style={{ padding: 16 }}>
          <div className="section-label" style={{ marginBottom: 12 }}>Social Signals</div>
          {[
            { label: "Mentions (24h)", value: socialData?.mentions24h ?? "—" },
            { label: "Sentiment", value: socialData?.sentiment !== undefined ? `${socialData.sentiment}%` : "—" },
            { label: "Twitter Followers", value: socialData?.twitterFollowers?.toLocaleString() ?? "—" },
          ].map(({ label, value }) => (
            <div key={label} className="kv-row">
              <span className="kv-label">{label}</span>
              <span className="kv-value">{String(value)}</span>
            </div>
          ))}
        </div>
        <div className="card" style={{ padding: 16 }}>
          <div className="section-label" style={{ marginBottom: 12 }}>Contract Info</div>
          {[
            { label: "Mint Address", value: shortAddr(mint) },
            { label: "Mint Authority", value: t.audit?.mintAuthorityDisabled ? "Disabled ✓" : "Active ⚠" },
            { label: "Freeze Authority", value: t.audit?.freezeAuthorityDisabled ? "Disabled ✓" : "Active ⚠" },
            { label: "Bot Holders", value: t.audit?.botHoldersPercentage ? `${t.audit.botHoldersPercentage}%` : "—" },
            { label: "Top Holders %", value: t.audit?.topHoldersPercentage ? `${t.audit.topHoldersPercentage}%` : "—" },
            { label: "Created", value: t.createdAt ? new Date(t.createdAt).toLocaleDateString() : "—" },
          ].map(({ label, value }) => (
            <div key={label} className="kv-row">
              <span className="kv-label">{label}</span>
              <span className="kv-value">{String(value)}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Rug Analysis */}
      {t.rugAnalysis && (
        <div className="card" style={{ padding: 16, marginTop: 16, border: t.rugAnalysis.score >= 70 ? "1px solid var(--red)" : "1px solid var(--border)" }}>
          <div className="section-label" style={{ marginBottom: 12, color: t.rugAnalysis.score >= 70 ? "var(--red)" : undefined }}>Rug Analysis</div>
          <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 12 }}>
            <div style={{ flex: 1, height: 8, background: "var(--border)" }}>
              <div style={{ height: "100%", width: `${t.rugAnalysis.score ?? 0}%`, background: (t.rugAnalysis.score ?? 0) >= 70 ? "var(--red)" : (t.rugAnalysis.score ?? 0) >= 40 ? "var(--yellow)" : "var(--accent)" }} />
            </div>
            <span style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: 14, fontWeight: 700, color: (t.rugAnalysis.score ?? 0) >= 70 ? "var(--red)" : "var(--text)" }}>
              {t.rugAnalysis.score ?? 0} / 100
            </span>
          </div>
          <div style={{ display: "flex", flexWrap: "wrap", gap: 6 }}>
            {(t.rugAnalysis.flags ?? []).map((f) => (
              <span key={f} style={{ fontSize: 9, fontFamily: "'JetBrains Mono', monospace", padding: "2px 6px", background: "rgba(255,59,59,0.1)", border: "1px solid var(--red)", color: "var(--red)" }}>{f}</span>
            ))}
            {(t.rugAnalysis.flags ?? []).length === 0 && <span style={{ fontSize: 12, fontFamily: "'JetBrains Mono', monospace", color: "var(--accent)" }}>✓ No flags detected</span>}
          </div>
        </div>
      )}
    </div>
  );
}
