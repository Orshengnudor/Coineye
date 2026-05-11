import React from "react";
import { useQuery } from "@tanstack/react-query";
import Link from "next/link";

export default function Community() {
  const { data, isLoading } = useQuery({
    queryKey: ["community"],
    queryFn: async () => {
      const r = await fetch("/api/analytics/community");
      const j = await r.json();
      return Array.isArray(j?.data) ? j.data : [];
    },
  });
  const tokens = data ?? [];

  return (
    <div style={{ padding: "24px 28px", maxWidth: 1200 }}>
      <div style={{ marginBottom: 20 }}>
        <h1 style={{ fontFamily: "'Syne', sans-serif", fontSize: 22, fontWeight: 800, margin: 0 }}>
          ◈ CT <span style={{ color: "var(--accent)" }}>Buzz</span>
        </h1>
        <div style={{ color: "var(--text-muted)", fontSize: 12, fontFamily: "'JetBrains Mono', monospace", marginTop: 4 }}>Crypto Twitter engagement — ranked by CT likes & holder growth</div>
      </div>
      <div style={{ background: "var(--surface)", border: "1px solid var(--border)" }}>
        <div style={{ display: "grid", gridTemplateColumns: "36px 1fr 80px 80px 80px 100px 90px", padding: "8px 12px", borderBottom: "1px solid var(--border)" }}>
          {["#", "Token", "CT Likes", "Smart", "Ratio", "Holders Δ", "Organic"].map((h) => (
            <div key={h} style={{ fontSize: 10, fontFamily: "'JetBrains Mono', monospace", color: "var(--text-muted)", textTransform: "uppercase", letterSpacing: "0.08em" }}>{h}</div>
          ))}
        </div>
        {isLoading ? (
          <div style={{ padding: 24, textAlign: "center", color: "var(--text-muted)", fontFamily: "'JetBrains Mono', monospace", fontSize: 12 }}>Loading...</div>
        ) : tokens.length === 0 ? (
          <div style={{ padding: 40, textAlign: "center", color: "var(--text-muted)", fontFamily: "'JetBrains Mono', monospace", fontSize: 13 }}>No community data</div>
        ) : (
          tokens.map((t, i) => (
            <div key={t.mint ?? i} style={{ display: "grid", gridTemplateColumns: "36px 1fr 80px 80px 80px 100px 90px", padding: "10px 12px", borderBottom: "1px solid var(--border)", alignItems: "center" }}
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
              <span style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: 12, color: "var(--accent)" }}>{t.ctLikes ?? 0}</span>
              <span style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: 12, color: "var(--text-muted)" }}>{t.smartCtLikes ?? 0}</span>
              <span style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: 12, color: (t.smartRatio ?? 0) > 50 ? "var(--accent)" : "var(--text-muted)" }}>{t.smartRatio ?? 0}%</span>
              <span style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: 12, color: (t.holderChange24h ?? 0) >= 0 ? "var(--accent)" : "var(--red)" }}>
                {(t.holderChange24h ?? 0) >= 0 ? "+" : ""}{t.holderChange24h ?? 0}
              </span>
              <span style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: 12, color: "var(--text-muted)" }}>{t.organicScore ?? 0}</span>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
