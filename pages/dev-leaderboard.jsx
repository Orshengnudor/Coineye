import React from "react";
import { useQuery } from "@tanstack/react-query";
import Link from "next/link";

function shortAddr(a) {
  if (!a) return "—";
  return `${a.slice(0, 5)}…${a.slice(-4)}`;
}

function fmt(n) {
  if (!n) return "—";
  if (n >= 1e6) return `$${(n / 1e6).toFixed(2)}M`;
  if (n >= 1e3) return `${n.toFixed(2)} SOL`;
  return `${n.toFixed(3)} SOL`;
}

const REP_COLORS = { "Clean": "var(--accent)", "Suspicious": "var(--yellow)", "Repeat Minter": "var(--yellow)", "Serial Rugger": "var(--red)" };

export default function DevLeaderboard() {
  const { data, isLoading } = useQuery({
    queryKey: ["dev-leaderboard"],
    queryFn: async () => {
      const r = await fetch("/api/analytics/dev-leaderboard");
      const j = await r.json();
      return Array.isArray(j?.data) ? j.data : [];
    },
  });
  const devs = data ?? [];

  return (
    <div style={{ padding: "24px 28px", maxWidth: 1200 }}>
      <div style={{ marginBottom: 20 }}>
        <h1 style={{ fontFamily: "'Syne', sans-serif", fontSize: 22, fontWeight: 800, margin: 0 }}>
          ◬ Dev <span style={{ color: "var(--accent)" }}>Leaderboard</span>
        </h1>
        <div style={{ color: "var(--text-muted)", fontSize: 12, fontFamily: "'JetBrains Mono', monospace", marginTop: 4 }}>Top earning developers on Bags.fm ranked by lifetime fees</div>
      </div>
      <div style={{ background: "var(--surface)", border: "1px solid var(--border)" }}>
        <div style={{ display: "grid", gridTemplateColumns: "36px 1fr 120px 80px 100px 100px", padding: "8px 12px", borderBottom: "1px solid var(--border)" }}>
          {["#", "Developer", "Total Fees", "Tokens", "Reputation", "Volume"].map((h) => (
            <div key={h} style={{ fontSize: 10, fontFamily: "'JetBrains Mono', monospace", color: "var(--text-muted)", textTransform: "uppercase", letterSpacing: "0.08em" }}>{h}</div>
          ))}
        </div>
        {isLoading ? (
          <div style={{ padding: 24, textAlign: "center", color: "var(--text-muted)", fontFamily: "'JetBrains Mono', monospace", fontSize: 12 }}>Loading...</div>
        ) : devs.length === 0 ? (
          <div style={{ padding: 40, textAlign: "center", color: "var(--text-muted)", fontFamily: "'JetBrains Mono', monospace", fontSize: 13 }}>No dev data — check BAGS_API_KEY</div>
        ) : (
          devs.map((d, i) => (
            <div key={d.wallet ?? i} style={{ display: "grid", gridTemplateColumns: "36px 1fr 120px 80px 100px 100px", padding: "10px 12px", borderBottom: "1px solid var(--border)", alignItems: "center" }}
              onMouseEnter={(e) => (e.currentTarget.style.background = "var(--surface-raised)")}
              onMouseLeave={(e) => (e.currentTarget.style.background = "transparent")}
            >
              <span style={{ color: "var(--text-muted)", fontFamily: "'JetBrains Mono', monospace", fontSize: 12 }}>{i + 1}</span>
              <div>
                <div style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: 12, fontWeight: 600, color: "var(--text)" }}>
                  {d.username ? `@${d.username}` : shortAddr(d.wallet)}
                </div>
                <Link href={`/dev/${d.wallet}`}>
                  <div style={{ fontSize: 10, color: "var(--text-muted)", cursor: "pointer" }}>{shortAddr(d.wallet)} ↗</div>
                </Link>
              </div>
              <span style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: 12, color: "var(--accent)", fontWeight: 600 }}>{d.totalFeesSol?.toFixed(3)} SOL</span>
              <span style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: 12, color: "var(--text-muted)" }}>{d.tokenCount}</span>
              <span style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: 11, color: REP_COLORS[d.reputation] ?? "var(--text-muted)" }}>{d.reputation}</span>
              <span style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: 12, color: "var(--text-muted)" }}>{fmt(d.totalVolume)}</span>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
