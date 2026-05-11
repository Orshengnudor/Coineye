import React from "react";

export function StatCard({ label, value, sub, trend, accent, icon, live }) {
  const trendColor = trend === undefined ? "" : trend >= 0 ? "var(--accent)" : "var(--red)";
  const trendSign = trend !== undefined && trend > 0 ? "+" : "";

  return (
    <div
      style={{
        background: accent ? "var(--accent-dim)" : "var(--surface)",
        borderLeft: accent ? "2px solid var(--accent)" : "2px solid transparent",
        padding: "14px 18px",
        display: "flex",
        flexDirection: "column",
        gap: 3,
        minWidth: 0,
        position: "relative",
        overflow: "hidden",
      }}
    >
      {accent && (
        <div style={{
          position: "absolute", top: 0, left: 0, right: 0, height: 1,
          background: "linear-gradient(90deg, var(--accent-muted), transparent)",
        }} />
      )}
      <div style={{
        display: "flex", alignItems: "center", gap: 5,
        color: "var(--text-faint)", fontSize: 10, letterSpacing: "0.09em",
        textTransform: "uppercase", fontFamily: "'JetBrains Mono', monospace", fontWeight: 600,
      }}>
        {live && <span className="pulse-dot" />}
        {icon && !live && <span style={{ fontSize: 12, color: accent ? "var(--accent)" : "var(--text-faint)" }}>{icon}</span>}
        {label}
      </div>
      <div style={{
        fontFamily: "'JetBrains Mono', monospace", fontSize: 20, fontWeight: 700,
        color: accent ? "var(--accent)" : "var(--text)", lineHeight: 1.15, marginTop: 2, letterSpacing: "-0.01em",
      }}>
        {value}
      </div>
      <div style={{ display: "flex", gap: 8, alignItems: "center" }}>
        {trend !== undefined && (
          <span style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: 11, color: trendColor, fontWeight: 600 }}>
            {trendSign}{Number(trend).toFixed(2)}%
          </span>
        )}
        {sub && (
          <span style={{ fontSize: 11, color: "var(--text-faint)", fontFamily: "'JetBrains Mono', monospace" }}>
            {sub}
          </span>
        )}
      </div>
    </div>
  );
}
